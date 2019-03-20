<template>
	<el-tabs v-model="activeName" @tab-click="handleClick">
		<!--标引弹框-->
		<el-dialog title="请选择查询的主题词"  :visible.sync="dialogTableVisible">
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

	<!--住院小结标引tab页-->
		<el-tab-pane label="住院小结表(133)"  name="first">

			<section>
				<!--工具条-->
				<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
					<el-form :inline="true" :model="filters">
						<el-form-item>
							<el-input placeholder="请输入关键字查询"></el-input>
						</el-form-item>
						<el-form-item>
							<span class="demonstration">请选择标引状态 </span>
							<el-select v-model="value" placeholder="请选择标引状态">
								<el-option
										v-for="item in options"
										:key="item.value"
										:label="item.label"
										:value="item.value">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item>
							<div class="block">
								<span class="demonstration">请选择起止时间 </span>
								<el-date-picker
										v-model="value5"
										type="datetimerange"
										:picker-options="pickerOptions2"
										range-separator="至"
										start-placeholder="开始日期"
										end-placeholder="结束日期"
										align="right">
								</el-date-picker>
							</div>
						</el-form-item>

						<el-form-item>
							<el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
						</el-form-item>

						<el-form-item>
							<el-button type="primary" v-on:click="getUsers">查询</el-button>
						</el-form-item>
					</el-form>
				</el-col>

				<!--列表-->
				<el-table :data="tableData" highlight-current-row @selection-change="selsChange" style="width: 100%;">
					<el-table-column type="index" width="60">
					</el-table-column>
					<el-table-column prop="JZLSH" label="住院就诊流水号" width="120" sortable>
					</el-table-column>
					<el-table-column prop="YLJGDM" label="医疗机构代码" width="100"  sortable>
					</el-table-column>
					<el-table-column prop="XM" label="姓名" width="90" sortable>
					</el-table-column>
					<el-table-column prop="KSMC" label="年龄" width="120" sortable>
					</el-table-column>
					<el-table-column prop="KSMC" label="科室名称" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="RYSJ" label="入院时间" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="CYSJ" label="出院时间" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="ZZYSXM" label="主治医师" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="byzt" label="标引状态" min-width="180" sortable>
					</el-table-column>
					<el-table-column prop="czz" label="操作者" min-width="170" sortable>
					</el-table-column>
					<el-table-column label="操作" width="200">
						<template scope="scope">
							<el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
						</template>
					</el-table-column>
				</el-table>

				<!--翻页工具条-->
				<el-col :span="24" class="toolbar">
					<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
					</el-pagination>
				</el-col>

				<!--已标引的关键字列表-->
				<el-dialog title="已关联列表" v-model="markedFormVisible" :close-on-click-modal="false">
					<!--工具条-->
					<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
						<el-form :inline="true" :model="filters">
							<el-form-item>
								<el-input placeholder="请输入关键字查询"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" v-on:click="getUsers">查询</el-button>
							</el-form-item>
						</el-form>
					</el-col>

					<el-table :data="markData" highlight-current-row  style="width: 100%;">
						<el-table-column type="index" width="60">
						</el-table-column>
						<el-table-column prop="keyword" label="关键字" width="120" sortable>
						</el-table-column>
						<el-table-column prop="meshword" label="主题词" width="90" sortable>
						</el-table-column>
						<el-table-column prop="marktime" label="标引时间" width="90" sortable>
						</el-table-column>
						<el-table-column prop="marker" label="标引者" width="120" sortable>
						</el-table-column>
						<el-table-column label="操作" width="200">
							<template scope="scope">
								<el-button type="danger" size="small">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<div slot="footer" class="dialog-footer">
						<el-button type="primary" @click.native="markedFormVisible = false" :loading="editLoading">关闭</el-button>
					</div>
				</el-dialog>



				<!--标引界面-->
				<el-dialog title="数据标引" v-model="addFormVisible" :close-on-click-modal="false">
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
						<el-form-item label="标引内容" prop="des">
							<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
						</el-form-item>
						<el-form-item label="关联关系">
							<div>
								<el-tag>呕吐现象->胃炎</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>持续性上腹隐痛->胃炎</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>呕吐现象->胃炎</el-tag>
							</div>
						</el-form-item>
					</el-form>

					<div slot="footer" class="dialog-footer">
						<el-button @click.native="addFormVisible = false">取消</el-button>
						<el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>
					</div>
				</el-dialog>

			</section>
		</el-tab-pane>

		<!--手术明细tab页-->
		<el-tab-pane label="手术明细表(0)" name="second">
			<section>
				<!--工具条-->
				<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
					<el-form :inline="true" :model="filters">
						<el-form-item>
							<el-input placeholder="请输入关键字查询"></el-input>
						</el-form-item>
						<el-form-item>
							<span class="demonstration">请选择标引状态 </span>
							<el-select v-model="value" placeholder="请选择标引状态">
								<el-option
										v-for="item in options"
										:key="item.value"
										:label="item.label"
										:value="item.value">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item>
							<div class="block">
								<span class="demonstration">请选择起止时间 </span>
								<el-date-picker
										v-model="value5"
										type="datetimerange"
										:picker-options="pickerOptions2"
										range-separator="至"
										start-placeholder="开始日期"
										end-placeholder="结束日期"
										align="right">
								</el-date-picker>
							</div>
						</el-form-item>

						<el-form-item>
							<el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
						</el-form-item>

						<el-form-item>
							<el-button type="primary" v-on:click="getUsers">查询</el-button>
						</el-form-item>
					</el-form>
				</el-col>

				<!--列表-->
				<el-table :data="tableData2" highlight-current-row @selection-change="selsChange" style="width: 100%;">
					<el-table-column type="index" width="60">
					</el-table-column>
					<el-table-column prop="name" label="患者姓名" width="120" sortable>
					</el-table-column>
					<el-table-column prop="sex" label="性别" width="100"  sortable>
					</el-table-column>
					<el-table-column prop="age" label="年龄" width="90" sortable>
					</el-table-column>
					<el-table-column prop="birth" label="出生年月" width="120" sortable>
					</el-table-column>
					<el-table-column prop="addr" label="家庭地址" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="bingli" label="病历描述" min-width="180" sortable>
					</el-table-column>
					<el-table-column prop="byzt" label="标引状态" min-width="180" sortable>
					</el-table-column>
					<el-table-column prop="czz" label="操作者" min-width="170" sortable>
					</el-table-column>
					<el-table-column label="操作" width="200">
						<template scope="scope">
							<el-button size="small" @click="showMarkedList()">查看已标引</el-button>
							<el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
						</template>
					</el-table-column>
				</el-table>

				<!--翻页工具条-->
				<el-col :span="24" class="toolbar">
					<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
					</el-pagination>
				</el-col>


				<!--标引界面-->
				<el-dialog title="数据标引" v-model="addFormVisible" :close-on-click-modal="false">
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
						<el-form-item label="标引内容" prop="des">
							<div  v-html="markContent"  v-on:click="getSelectionText" style="background-color:#F2F2F2;"></div>
						</el-form-item>
						<el-form-item label="关联关系">
							<div>
								<el-tag>呕吐现象->胃炎</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>持续性上腹隐痛->胃炎</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>轻度器质性病变->胃溃疡</el-tag>
								<el-tag>呕吐现象->胃炎</el-tag>
							</div>
						</el-form-item>
					</el-form>

					<div slot="footer" class="dialog-footer">
						<el-button @click.native="addFormVisible = false">取消</el-button>
						<el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>
					</div>
				</el-dialog>

			</section>
		</el-tab-pane>

		<!--诊断明细表tab-->
		<el-tab-pane label="诊断明细表(0)" name="third">
			<section>
				<!--工具条-->
				<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
					<el-form :inline="true" :model="filters">
						<el-form-item>
							<el-input placeholder="请输入关键字查询"></el-input>
						</el-form-item>
						<el-form-item>
							<span class="demonstration">请选择标引状态 </span>
							<el-select v-model="value" placeholder="请选择标引状态">
								<el-option
										v-for="item in options"
										:key="item.value"
										:label="item.label"
										:value="item.value">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item>
							<div class="block">
								<span class="demonstration">请选择起止时间 </span>
								<el-date-picker
										v-model="value5"
										type="datetimerange"
										:picker-options="pickerOptions2"
										range-separator="至"
										start-placeholder="开始日期"
										end-placeholder="结束日期"
										align="right">
								</el-date-picker>
							</div>
						</el-form-item>

						<el-form-item>
							<el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
						</el-form-item>

						<el-form-item>
							<el-button type="primary" v-on:click="getUsers">查询</el-button>
						</el-form-item>
					</el-form>
				</el-col>

				<!--列表-->
				<el-table :data="tableData3" highlight-current-row @selection-change="selsChange" style="width: 100%;">
					<el-table-column type="index" width="60">
					</el-table-column>
					<el-table-column prop="name" label="患者姓名" width="120" sortable>
					</el-table-column>
					<el-table-column prop="sex" label="性别" width="100"  sortable>
					</el-table-column>
					<el-table-column prop="age" label="年龄" width="90" sortable>
					</el-table-column>
					<el-table-column prop="birth" label="出生年月" width="120" sortable>
					</el-table-column>
					<el-table-column prop="addr" label="家庭地址" min-width="170" sortable>
					</el-table-column>
					<el-table-column prop="bingli" label="病历描述" min-width="180" sortable>
					</el-table-column>
					<el-table-column prop="byzt" label="标引状态" min-width="180" sortable>
					</el-table-column>
					<el-table-column prop="czz" label="操作者" min-width="170" sortable>
					</el-table-column>
					<el-table-column label="操作" width="200">
						<template scope="scope">
							<el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
						</template>
					</el-table-column>
				</el-table>

				<!--翻页工具条-->
				<el-col :span="24" class="toolbar">
					<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
					</el-pagination>
				</el-col>






			</section>
		</el-tab-pane>
	</el-tabs>



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
				activeName: 'first',
				filterText: '',
				data4: JSON.parse(JSON.stringify(data)),
				dialogTableVisible:false,
				filters: {
					name: ''
				},
				markContent:'&nbsp;&nbsp;&nbsp;头疼已经3个月，偶尔伴有<span style="color: red;text-decoration:underline">呕吐现象</span>(已关联主题词：<span style="color: green;text-decoration:underline ">胃炎</span>)，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，之前检查显示胃上有肿瘤头疼已经3个月，偶尔伴有呕吐现象，' +
						'非溃疡性消化不良是一种功能性胃病，也有少部分属于<span style="color: red;text-decoration:underline">轻度器质性病变</span>(已关联主题词：<span style="color: green;text-decoration:underline ">胃溃疡</span>)，过去很多医生将该病诊断为慢性胃炎、胃神经功能症、胃肠道植物神经功能紊乱、胃功能性消化不良、胃痉挛等。据最新流行病学权威调查，' +
						'这种病在人群中的发病率高达10%，也是胃的常见和多发病。患者会有间歇性或<span style="color: red;text-decoration:underline">持续性上腹隐痛</span>(已关联主题词：<span style="color: green;text-decoration:underline ">胃炎</span>)或偶有剧痛及不适、恶心、呕吐、反酸、烧心等上消化道症状，但临床检查如胃镜、上消化道钡剂造影和肝胆胰B超等，并不能发现胃和其他脏器有引起这些症状的器质性病变或轻微病变。也就是说胃的主观症状较多，但客观检查阳性发现少或者无。其病因应与胃运动功能障碍、胃十二指肠轻度炎症、精神因素有关。',
				tableData: [{
					JZLSH:'jz001',
					YLJGDM:'WH123',
					XM:'刘桂花',
					KSMC:'呼吸科',
					RYSJ:'2018-10-23',
					CYSJ:'2018-11-10',
					ZZYSXM:'张德华教授',
					byzt:'未标引',
					czz:'刘东升',
				}, {
					JZLSH:'jz001',
					YLJGDM:'WH123',
					XM:'刘桂花',
					KSMC:'呼吸科',
					RYSJ:'2018-10-23',
					CYSJ:'2018-11-10',
					ZZYSXM:'张德华教授',
					byzt:'未标引',
					czz:'刘东升',
				}, {
					JZLSH:'jz001',
					YLJGDM:'WH123',
					XM:'刘桂花',
					KSMC:'呼吸科',
					RYSJ:'2018-10-23',
					CYSJ:'2018-11-10',
					ZZYSXM:'张德华教授',
					byzt:'未标引',
					czz:'刘东升',
				}, {
					JZLSH:'jz001',
					YLJGDM:'WH123',
					XM:'刘桂花',
					KSMC:'呼吸科',
					RYSJ:'2018-10-23',
					CYSJ:'2018-11-10',
					ZZYSXM:'张德华教授',
					byzt:'未标引',
					czz:'刘东升',
				}, {
					JZLSH:'jz001',
					YLJGDM:'WH123',
					XM:'刘桂花',
					KSMC:'呼吸科',
					RYSJ:'2018-10-23',
					CYSJ:'2018-11-10',
					ZZYSXM:'张德华教授',
					byzt:'未标引',
					czz:'刘东升',
				}],
				options: [{
					value: '选项1',
					label: '未标引'
				}, {
					value: '选项2',
					label: '已标引'
				}, {
					value: '选项3',
					label: '标引中'
				}],

				markData: [{
					keyword:'呕吐',
					meshword:'胃炎',
					marktime:'2018-02-22',
					marker:'张国华',
				}, {
					keyword:'呕吐',
					meshword:'胃炎',
					marktime:'2018-02-22',
					marker:'张国华',
				}, {
					keyword:'呕吐',
					meshword:'胃炎',
					marktime:'2018-02-22',
					marker:'张国华',
				}, {
					keyword:'呕吐',
					meshword:'胃炎',
					marktime:'2018-02-22',
					marker:'张国华',
				}, {
					keyword:'呕吐',
					meshword:'胃炎',
					marktime:'2018-02-22',
					marker:'张国华',
				}],
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				value4: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
				value5: '',

				value: '',
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				markedFormVisible:false,

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '张三',
					sex: '男',
					age: 34,
					birth: '',
					addr: '湖北省武汉市洪山区关山街道',
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
			this.$router.push({ path: '/page10' });
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
		}
	}
	}

</script>
<style>
	.text {
		font-size: 14px;
	}

	.item {
		margin-bottom: 18px;
	}

	.clearfix:before,
	.clearfix:after {
		display: table;
		content: "";
	}
	.clearfix:after {
		clear: both
	}

	.box-card {
		width: 480px;
	}

</style>