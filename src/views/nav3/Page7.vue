<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-select v-model="filters.value" placeholder="请选择数据类别">
					<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
					</el-option>
				</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="请输入患者名称"></el-input>
				</el-form-item>
				<el-form-item>
				<el-button type="info" @click="dialogTableVisible = true" round>通过MESH库树选择</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="tableData" highlight-current-row  style="width: 100%;" v-bind:title="fullContext">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="患者姓名" width="120" sortable>
			</el-table-column>
			<el-table-column prop="sex" label="性别" width="100" :formatter="formatSex" sortable>
			</el-table-column>
			<el-table-column prop="age" label="年龄" width="100" sortable>
			</el-table-column>
			<el-table-column prop="birth" label="出生年月" width="120" sortable>
			</el-table-column>
			<el-table-column prop="addr" label="家庭地址" min-width="180" sortable>
			</el-table-column>
			<el-table-column prop="bingli" label="病历描述"  min-width="180" sortable>
			</el-table-column>
			<el-table-column prop="byzt" label="标引状态" min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button type="danger" size="small" @click="showDetail(scope.$index, scope.row)">查看详情</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="editForm.sex">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="0">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="年龄">
					<el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="生日">
					<el-date-picker type="date" placeholder="选择日期" v-model="editForm.birth"></el-date-picker>
				</el-form-item>
				<el-form-item label="地址">
					<el-input type="textarea" v-model="editForm.addr"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="查看详情" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="性别">
						<el-input v-model="addForm.sex" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="年龄">
					<el-input v-model="addForm.age" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="生日">
					<el-input v-model="addForm.birth" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="地址">
					<el-input type="textarea" v-model="addForm.addr"></el-input>
				</el-form-item>
				<el-form-item label="病历描述">
					<el-input type="textarea" v-model="addForm.des" rows="5"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">关闭</el-button>
			</div>
		</el-dialog>

		<el-dialog title="MESH库树形" :visible.sync="dialogTableVisible">
			<el-input
					placeholder="输入关键字进行过滤"
					v-model="filterText">
			</el-input>
			<el-tree
					:data="data4"
					show-checkbox
					node-key="id"
					default-expand-all
					:expand-on-click-node="false"
					:render-content="renderContent"
					:filter-node-method="filterNode"
					ref="tree2">
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="dialogTableVisible = false">取消</el-button>
				<el-button type="primary" @click.native="dialogTableVisible = false">确定</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	export default {
		watch: {
			filterText(val) {
				this.$refs.tree2.filter(val);
			}
		},
		data() {
			const data = [{
				id: 1,
				label: '消化系统(A1)',
				children: [{
					id: 4,
					label: '胃类疾病(A1.456)',
					children: [{
						id: 9,
						label: '胃肿瘤(A1.456.313)'
					}, {
						id: 10,
						label: '胃溃疡(A1.456.314)'
					}]
				}]
			}, {
				id: 2,
				label: '呼吸系统(A2)',
				children: [{
					id: 5,
					label: '肺结核(A2.457)'
				}, {
					id: 6,
					label: '肺肿瘤(A2.458)'
				}]
			}, {
				id: 3,
				label: '循环系统(A3)',
				children: [{
					id: 7,
					label: '白血病(A3.334)'
				}, {
					id: 8,
					label: '血吸虫(A3.335)'
				}]
			}];
			return {
				filterText: '',
				data4: JSON.parse(JSON.stringify(data)),
				data5: JSON.parse(JSON.stringify(data)),
				filters: {
					name: ''
				},
				tableData: [{
					name:'刘桂香',
					sex:'女',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'未标引',
				}, {
					name:'王声海',
					sex:'男',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'已标引',
				}, {
					name:'王声海',
					sex:'男',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'已标引',
				},{
					name:'王声海',
					sex:'男',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'已标引',
				},{
					name:'王声海',
					sex:'男',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'已标引',
				},{
					name:'王声海',
					sex:'男',
					age:'47',
					birth:'1973-03-13',
					addr:'湖北省武汉市洪山区关山街道',
					bingli:'头疼已经3个月,偶尔伴有呕吐..',
					byzt:'标引中',
				}],
				options: [ {
					value: 'tb_yl_mz_medical_record',
					label: '门诊数据'
				}, {
					value: '选项3',
					label: '医疗数据'
				}],
				dialogTableVisible: false,
				value: '',
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				fullContext:'头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤',

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '刘桂香',
					sex: 'nan',
					age: 28,
					birth: '1974-10-23',
					addr: '湖北省武汉市洪山区关山街道',
					des:'头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤,头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤'
				}

			}
		},
		methods: {
			//过滤树上的节点
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getUsers();
			},
			//获取用户列表
			getUsers() {
				let para = {
					page: this.page,
					name: this.filters.name
				};
				this.listLoading = true;
				//NProgress.start();
				getUserListPage(para).then((res) => {
					this.total = res.data.total;
					this.users = res.data.users;
					this.listLoading = false;
					//NProgress.done();
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			showDetail: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '刘桂香',
					sex: '男',
					age: 28,
					birth: '1974-10-23',
					addr: '湖北省武汉市洪山区关山街道',
					des:'头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤,头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤'
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							editUser(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getUsers();
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getUsers();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getUsers();
		}
	}

</script>

<style scoped>

</style>