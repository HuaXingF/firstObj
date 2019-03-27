<template>
  <el-col :span="24" class="toolbar_f" style="padding-bottom: 0px;">
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      style="margin:20px;width:60%;min-width:600px;"
    >
      <el-form-item label="标引次数">
        <el-input v-model="form.num" placeholder="超过此次数将被用于自动标引..."></el-input>
      </el-form-item>
      <el-form-item label="生效树形">
        <el-select v-model="form.name" placeholder="请选择生效树形">
         <!-- <el-option label="MESH树" value="MESH树"></el-option>
          <el-option label="UMLS树" value="UMLS树"></el-option>-->
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.itemName"
            :value="item.name"
          ></el-option>
        </el-select>
      </el-form-item>

      <!--
		<el-form-item label="活动时间">
			<el-col :span="11">
				<el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
			</el-col>
			<el-col class="line" :span="2">-</el-col>
			<el-col :span="11">
				<el-time-picker type="fixed-time" placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
			</el-col>
		</el-form-item>
		<el-form-item label="即时配送">
			<el-switch on-text="" off-text="" v-model="form.delivery"></el-switch>
		</el-form-item>
		<el-form-item label="活动性质">
			<el-checkbox-group v-model="form.type">
				<el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
				<el-checkbox label="地推活动" name="type"></el-checkbox>
				<el-checkbox label="线下主题活动" name="type"></el-checkbox>
				<el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
			</el-checkbox-group>
		</el-form-item>
		<el-form-item label="特殊资源">
			<el-radio-group v-model="form.resource">
				<el-radio label="线上品牌商赞助"></el-radio>
				<el-radio label="线下场地免费"></el-radio>
			</el-radio-group>
		</el-form-item>
		<el-form-item label="活动形式">
			<el-input type="textarea" v-model="form.desc"></el-input>
		</el-form-item>
      -->
      <el-form-item>
        <el-button @click.native.prevent>取消</el-button>
        <el-button type="primary" v-on:click="addSubmit">保存设置</el-button>
      </el-form-item>
    </el-form>
    <!--消息提示框-->
   <!--<el-button :plain="true" @click="openVn">VNode</el-button>-->
  </el-col>

</template>



<script>
export default {
  data() {
    return {
      form: {
        num: null,
        name: null,
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",

      },
       options:[],
      settings:[]
    };
  },
  mounted() {
    // this.queryTotal();
    // this.options =  this.queryTotal();
    // this.options.push();
    // this.options.pop();
    this.init();
    this.queryTotal()
  },
  methods: {

    queryTotal() {
      //查询所以树形
      this.$http.get("biaoyin/tbDictionary/selectAll.do").then(({ data }) => {

        this.options = data


      });
    },
   init(){
     this.$http.get("biaoyin/tbSysSettings/queryTotal.do").then(({data}) => {
       for (let i=0;i<data.length;i++) {
         if (data[i].itemName == "生效树形") {
           let treeName = data[i].itemValue;// 根据树形名称来取决于是什么树
           this.form.name=treeName;
         } else if (data[i].itemName == "标引次数"){
           let num = data[i].itemValue;// 根据树形名称来取决于是什么树
           this.form.num=num;
         }
       }
     })
   },
    onSubmit() {
      console.log("submit!");
    },
    addSubmit() {
      console.log(this.form.name, this.form.num);
      this.settings=[{"id":"1","itemValue":this.form.num},{"id":"2","itemValue":this.form.name}]
      this.$confirm("确认提交吗？", "提示", {})
        .then(() => {
          console.log(this.settings);
          this.$http.post("biaoyin/tbSysSettings/updateById", this.settings).then(data => {
            console.log(data);
            if(data){
              this.$message({
                message: "保存成功",
                type: "success"});
            }else{
              this.$message.error("保存失败")
            }
          });
        })
        .catch(() => {
          console.log("取消");
        });
    }
  }
};
</script>
