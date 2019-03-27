<template>
	<section>
		<!--标引界面-->
		<div>
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="基本信息：" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="门诊诊断" prop="des">
					<div
							v-html="markContent1"
							style="background-color:#F2F2F2;"
					></div>
				</el-form-item>
				<el-form-item label="入院诊断" prop="des">
					<div
							v-html="markContent2"
							style="background-color:#F2F2F2;"
					></div>
				</el-form-item>
				<el-form-item label="出院诊断" prop="des">
					<div
							v-html="markContent3"
							style="background-color:#F2F2F2;"
					></div>
				</el-form-item>
				<el-form-item label="诊疗过程" prop="des">
					<div
							v-html="markContent4"
							style="background-color:#F2F2F2;"
					></div>
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer" align="right">
				<el-button @click.native="gotobiaoyin">返回列表</el-button>
				<!--<el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>-->
				<!--<el-button type="primary" @click.native="markNext()">完成标引，标引下一条</el-button>-->
			</div>
		</div>
	</section>
</template>

<script>
	import util from "../../common/js/util";
	import { media } from "../../toolVue.js";

	//import NProgress from 'nprogress'
	import {
		getUserListPage,
		removeUser,
		batchRemoveUser,
		editUser,
		addUser
	} from "../../api/api";
	import directive from "element-ui/packages/popover/src/directive";
	export default {
		watch: {
			filterText(val) {
				this.$refs.tree2.filter(val);
			}
		},
		created() {
			// this.changfouce();
		},
		data() {
			return {
				selectText:"",
				selectText1:"",
				filterText: "",
				autofocus: "autofocus",
				panduan: false,// 用于添加与编辑的区分（主要用与区分更改与保存）
				list : {},// 编辑所需的对象
				biaoyin_list: null, //是否存在已标引的数据（主要用于用户未标引却点击完成标引）
				defaultProps: {
					children: 'children',
					label: 'label'
				},
				data4: [],
				dialogTableVisible: false,
				filters: {
					name: ""
				},
				object:[],
				num : 0,
				jzlsh: "",// 住院就诊流水号
				yljgdm: "",// 医疗机构代码
				treeName: "",// 树形名称
				obj: "",// {jzlsh: this.jzlsh,yljgdm: this.yljgdm}
				keywordfieldname:"",
				markContent1: "",
				markContent2: "",
				markContent3: "",
				markContent4: "",
				value: "",
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [], //列表选中列

				markedFormVisible: false,

				addFormVisible: false, //新增界面是否显示
				addLoading: false,
				addFormRules: {
					//name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
				},
				//新增界面数据
				addForm: {}
			};
		},
		methods: {
			//过滤树上的节点
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			selsChange: function(sels) {
				this.sels = sels;
			},
			delDialogTable(){
				this.dialogTableVisible = false;
				this.panduan = false;
			},
			showMarkedList() {
				this.markedFormVisible = true;
				this.autofocus = "autofocus";
			},
			gotobiaoyin() {
				this.$router.push({ path: "/page9" });
			},
			select1:function(keyword, meshword, i, treename){
				let pingjie = `<span style=\"color: red;text-decoration:underline\">`
						+ keyword
						+ `</span>(已关联<span style="color: green;text-decoration:underline " >`
						+ treename+`</span>主题词：<span style="color: green;text-decoration:underline " >`
						+ meshword
						+ `)</span>`;
				return pingjie;
			},
			select(){
				// 判断 门诊诊断、入院诊断、出院诊断、诊疗过程中的标引
				let keyWordId = "("+this.jzlsh+","+this.yljgdm+")";// 对应表id
				this.$http.get("biaoyin/tbLable/queryByKeyWord.do?keyWordTable=tb_cls_lh_summary&keyWordId="+keyWordId).then(({data}) => {
					this.biaoyin_list = data;// 赋值给是否存在标引的数据（主要用于用户未标引却点击完成标引）
					let list = data;
					for (let i=0; i<list.length; i++) {
						if (list[i].keywordfieldname == 'mzzd') { //判断是否为门诊诊断
							if (this.markContent1.indexOf(list[i].keyword) > -1) {
								let b=this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
								this.markContent1 = this.markContent1.replace(list[i].keyword, b);
							}
						}else if(list[i].keywordfieldname == 'ryzd'){ //判断是否为入院诊断
							if (this.markContent2.indexOf(list[i].keyword) > -1) {
								let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
								this.markContent2 = this.markContent2.replace(list[i].keyword, b);
							}
						}else if(list[i].keywordfieldname == 'cyzd'){//判断是否为入院诊断
							if (this.markContent3.indexOf(list[i].keyword) > -1) {
								let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
								this.markContent3 = this.markContent3.replace(list[i].keyword, b);
							}
						}else if(list[i].keywordfieldname == 'zlgc'){//判断是否为入院诊断
							if (this.markContent4.indexOf(list[i].keyword) > -1) {
								let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
								this.markContent4 = this.markContent4.replace(list[i].keyword, b);
							}
						}

					}
				});
			},
			init() {
				this.num = this.$route.query.i;// 接收的是第几行数据
				this.jzlsh = this.$route.query.jzlsh; // 接收page9传递的参数
				this.yljgdm = this.$route.query.yljgdm; // 接收page9传递的参数
				this.object = eval(this.$route.query.list); // 接收该页面所有数据的集合
				this.obj = {jzlsh: this.jzlsh,yljgdm: this.yljgdm};
				this.$http.post("biaoyin/tbClsLhSummary/queryByKey.do",this.obj)
						.then(({data})=>{
							let {xm,xb,nl,mzzd,ryzd,cyzd,zlgc} = data;
							this.addForm.name = `${xm}/${xb}/${nl}`;
							this.markContent1 = mzzd;
							this.markContent2 = ryzd;
							this.markContent3 = cyzd;
							this.markContent4 = zlgc;
							this.select();
						});
				// 通过树形选择
				this.$http.get("biaoyin/tbSysSettings/queryTotal.do").then(({data})=>{
					for (let i=0;i<data.length;i++) {
						if (data[i].itemName == "生效树形") {
							this.treeName = data[i].itemValue;// 根据树形名称来取决于是什么树
							this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + this.treeName).then(({data})=>{
								this.data4 = data;
							})
						}
					}
				});
			},
		},
		mounted() {
			this.init();

			// this.getUsers();
			/*media.$on("objInfo", obj => {
              //接受page9传过来的参数
              this.objInfo = obj;
              console.log(this.objInfo)
            });*/
		},

	};
</script>
