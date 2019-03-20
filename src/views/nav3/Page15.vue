<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="请输入关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getByName(1,10)">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="tableData" highlight-current-row  style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="keyword" label="关键字" width="250" sortable>
			</el-table-column>
			<el-table-column prop="meshword" label="主题词" width="160" sortable>
			</el-table-column>
			<el-table-column prop="treename" label="主题词体系" width="130" sortable>
			</el-table-column>
			<el-table-column prop="keywordtable" label="关键字来自表" width="150" sortable>
			</el-table-column>
			<el-table-column prop="keywordfieldname" label="关键字来自字段" width="160" sortable>
			</el-table-column>
			<el-table-column prop="auditstatus" label="审核结果" width="160" sortable>
			</el-table-column>
			<el-table-column prop="markedtime" label="创建时间" width="130" sortable>
			</el-table-column>

			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button type="danger" @click="showMarkDialog">进入审核</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--翻页工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination
					layout="prev, pager, next"
					@current-change="handleCurrentChange"
					:page-size="10"
					:total="total"
					style="float:right;"
			></el-pagination>
		</el-col>

		<!--标引审核界面-->
		<el-dialog title="标引审核" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="90px"  ref="addForm">
				<el-form-item label="关键字" prop="name">
					<el-input v-model="addForm.keyword" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="主题词" prop="name">
					<el-input v-model="addForm.meshword" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="主题词体系" prop="name">
					<el-input v-model="addForm.meshsystem" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="标引内容" prop="des">
					<div  v-html="addForm.markContent"   style="background-color:#F2F2F2;"></div>
				</el-form-item>


			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">审核不通过</el-button>
				<el-button type="primary" @click.native="addFormVisible = false">审核通过</el-button>
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
			return {
				filterText: '',
				data2: [{
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
				}],
				defaultProps: {
					children: 'children',
					label: 'label'
				},
				filters: {
					name: ''
				},
				tableData: [ ],

				options: [{
					value: '选项1',
					label: 'MESH体系'
				}, {
					value: '选项2',
					label: 'UMLS体系'
				}, {
					value: '选项3',
					label: '其他体系'
				}],


				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,

				//编辑界面数据
				editForm: {
					gjz:'胃部发炎',
					glc:'胃溃疡',
					bysj:'2016-10-23',
					bjz:'张国华',
					cdl:'A',
					cxl:'A1',
					bh:'233-234-343-3',
					bbh:'201601',
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
					/*keyword:'呕吐现象',
					meshword:'胃溃疡',
					meshsystem:'MESH体系',
					markContent:'呕吐现象往往和心悸同时发生，主要是因为肺部有效的呼吸面积变小了，身体缺少氧气，二氧化碳的排出也变慢，这些改变就刺激了管理呼吸的神经中枢，引起呼吸加快加深。' +
							'心前区直到胸部靠左边这个区域，一般心脏病并不引起心前区的疼痛，当心脏得不到足够营养和氧气，甚至心脏肌肉发生坏死的时候，分布在心脏肌肉和冠状血管附近的神经就会受到刺激，发生疼痛的感觉。' +
							'心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状。心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
							'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
							'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状',
*/
				}

			}
		},
		methods: {
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleCurrentChange(val) {
				this.page = val;
				//this.getUsers();
				let keyword=this.filters.name;
				if (keyword == null || keyword == "") {
					this.init(this.page);
				}else {
					this.getByName(this.page);
				}
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
			showMarkDialog: function () {
				this.addFormVisible = true;
				this.addForm = {
					keyword:'呕吐现象',
					meshword:'胃溃疡',
					meshsystem:'MESH体系',
					markContent:'<span style="color: red;text-decoration:underline">呕吐现象</span>(已关联MESH词典：<span style="color: green;text-decoration:underline ">胃溃疡</span>)  （<a href="#">删除标引</a>  <a href="#">编辑标引</a>）往往和心悸同时发生，主要是因为肺部有效的呼吸面积变小了，身体缺少氧气，二氧化碳的排出也变慢，这些改变就刺激了管理呼吸的神经中枢，引起呼吸加快加深。' +
							'心前区直到胸部靠左边这个区域，一般心脏病并不引起心前区的疼痛，当心脏得不到足够营养和氧气，甚至心脏肌肉发生坏死的时候，分布在心脏肌肉和冠状血管附近的神经就会受到刺激，发生疼痛的感觉。' +
							'心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状。心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
							'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
							'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状',



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
			//获取用户列表
			/*getUsers() {
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
			},*/
			init(pageNum = 1, pageSize = 10) {
				//请求出院小结数据数据列表
				this.$http
						.get(
								"biaoyin/tbUnlabled/findPage.do?pageNum=" +
								pageNum +
								"&&pageSize=" +
								pageSize
						)
						.then(({ data }) => {
							let list = data.rows;
							this.total = data.total;
							this.tableData = list;
						});
			},
			addDictory(){
				 this.addFormVisible=false;
				 this.$router.push({ path: '/page6', query: { showTabPane: "true" ,treeName:this.addForm.treeName,rootNodeName:this.addForm.rootNodeName} }) ;// 跳转到B
			},
			getByName(num =1,pageSize = 10){
				let keyword=this.filters.name;
				this.$http.get("biaoyin/tbUnlabled/findPage.do?pageSize="+pageSize+"&&pageNum="+num+"&&keyword="+keyword).then(({data}) => {
					this.tableData=data.rows;
					this.total = data.total;
				})
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
			// this.getUsers();
			this.init();
		}
	}

</script>

