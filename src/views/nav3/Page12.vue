<template>
	<section>


		<!--标引弹框-->
		<el-dialog title="请选择关联的主题词"  :visible.sync="dialogTableVisible">
			<div>当前所选关键词：<span style="color: red">{{this.getSelText()}}</span></div>
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

		<!--标引界面-->
		<div>
		<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
			<el-form-item label="姓名" prop="name">
				<el-input v-model="addForm.name" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="性别">
				<el-input v-model="addForm.sex" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="年龄">
				<el-input v-model="addForm.age" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="门诊诊断" prop="des">
				<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
			</el-form-item>
			<el-form-item label="入院诊断" prop="des">
				<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
			</el-form-item>
			<el-form-item label="出院诊断" prop="des">
				<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
			</el-form-item>
			<el-form-item label="诊疗过程" prop="des">
				<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
			</el-form-item>

		</el-form>

		<div slot="footer" class="dialog-footer" align="right">
			<el-button @click.native="gotobiaoyin">返回列表</el-button>
			<el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>
			<el-button type="primary" @click.native="markNext()">完成标引，标引下一条</el-button>
		</div>
		</div>


	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	var selectText;
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
				dialogTableVisible:false,
				filters: {
					name: ''
				},
				markContent:'呼吸困难往往和心悸同时发生，主要是因为肺部有效的呼吸面积变小了，身体缺少氧气，二氧化碳的排出也变慢，这些改变就刺激了管理呼吸的神经中枢，引起呼吸加快加深。' +
						'心前区直到胸部靠左边这个区域，一般心脏病并不引起心前区的疼痛，当心脏得不到足够营养和氧气，甚至心脏肌肉发生坏死的时候，分布在心脏肌肉和冠状血管附近的神经就会受到刺激，发生疼痛的感觉。' +
						'心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状。心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
						'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，' +
						'这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状心脏负荷过重导致静脉回流受阻，远端血管充血发生水肿，这也是心脏病的常见症状',



				value: '',
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				markedFormVisible:false,
				dialogTableVisible:false,

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '王声海',
					sex: '男',
					age: 44,
					birth: '',
					addr: '湖北省武汉市洪山区光谷软件园旁',
					des:'头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤',
					kw:'胃上异物',
					tw:'胃溃疡',
				}

			}
		},
	methods: {
		//过滤树上的节点
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},
		//显示编辑界面
		markText: function () {
			//this.addFormVisible = true;
			this.$router.push({ path: '/page6' });
		},
		selsChange: function (sels) {
			this.sels = sels;
		},
		getSelectionText:function(){
			this.selectText = window.getSelection().toString();
			if(this.selectText.toString()!='')
				this.dialogTableVisible = true;
		},
		getSelText:function(){
			this.selectText = window.getSelection().toString();
			return this.selectText;
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
		handleCurrentChange(val) {
			this.page = val;
			this.getUsers();
		},
		showMarkedList(){
			this.markedFormVisible = true;
		},
		mounted() {
			this.getUsers();
		},
		gotobiaoyin(){
			this.$router.push({ path: '/page9' });
		},
		markNext() {
			this.$confirm('是否确认完成该次标引并进入下一条?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				// this.$message({
				// 	type: 'success',
				// 	message: '删除成功!'
				// });
				this.$router.push({ path: '/page10' });
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消'
				});
			});
		}
	}
	}

</script>
