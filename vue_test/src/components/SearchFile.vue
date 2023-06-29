<template>
  <div class="container">  
    <h2>文件检索系统</h2>
    <div v-if="loadingDrives">加载硬盘中...</div>
    <div v-else>
        <div>
            <a v-if="directoryStack.length > 0" href="#" @click="goToParentDirectory">返回上级目录</a>
            <br>
            <span v-if="directoryStack.length > 0">当前文件夹{{ selectedDirectory.path }}</span>
        </div>
        <div class="directory-list">
            <ul>
              <li v-for="item in directory" :key="item.path">
              <a v-if="item.isDirectory" href="#" @click="enterDirectory(item.path)">{{ item.name }}</a>
              <span v-else>{{ item.name }}</span>
              </li>
          </ul>
        </div>
        <div>
            <button @click="submit">提交</button>
        </div>
    </div>
    <div class="input-container">
        <input type="text" v-model="keywords" placeholder="输入关键词" />
        <button class="upload-button" @click="SearchFiles">
          开始检索
        </button>
        <button class="save-button" @click="saveData">保存选中文件</button>

    </div>
    <!-- 检索结果 -->
    <h2>检索结果：</h2>
    <!-- 硬盘获取的加载状态 -->
     <div v-if="loadingFiles">加载检索结果中...</div>
     <div :class="'search-result directory-list'" v-if="!loadingFiles && searchResult.length">
      <div v-for="searchResult in searchResult" :key="searchResult.file">
        <h2>
          <label class="file-label">
            <input type="checkbox" v-model="searchResult.selected" @change="selectAllLines(searchResult)" />
            {{ searchResult.file }}
          </label>
        </h2>
        <ul>
          <li v-for="lines in searchResult.lines" :key="lines">
            <label>
              <input type="checkbox" v-model="lines.selected" @change="updateSelectedLines(searchResult)" />
              <span>行号: {{ lines[0] }}----</span>
              <span v-html="highlightKeyword(lines[1], keywords)"></span>
            </label>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style src="./SearchFile.css"></style>
<script>
import axios from "axios";
export default {
  name: "SearchFile",
  data() {
    return {
      loadingDrives: false, // 硬盘获取的加载状态
      loadingFiles: false, // 文件检索的加载状态
      directoryStack: [], // 用于保存目录路径的栈
      directory: [],
      selectedDirectory: null, // 选择的文件夹
      searchResult: [],// 检索结果
      keywords: "", // 用户输入的关键词
    };
  },
  mounted() {
    this.getDrives();
  },
  methods: {

    getDrives() {
      this.loadingDrives = true; // 开始加载硬盘获取
      axios.get('http://127.0.0.1:5000/api/getDrives')
        .then(response => {
          console.log("---------------------1------------------")
          console.log(response.data);
          this.directory = response.data.map(drive => ({
            name: drive,
            isDirectory: true,
            path: drive
          }));
          this.loadingDrives = false; // 加载硬盘获取完成
        })
        .catch(error => {
          console.error(error);
          this.loadingDrives = false; // 加载硬盘获取完成
        });
    },
    enterDirectory(path) {
      this.loading = true;
      this.selectedFiles = []; // 重置选择的文件列表
      axios.post('http://127.0.0.1:5000/api/getDirectory', { path })
        .then(response => {
          console.log("---------------------2------------------")
          console.log(response.data);
          this.directoryStack.push({
            directory: this.directory,
            selectedDirectory: this.selectedDirectory
          }); // 将当前目录和选定的文件夹路径保存到栈中
          this.directory = response.data.map(item => ({
            ...item,
            selected: false
          }));
          this.selectedDirectory = { path }; // 设置选定的文件夹路径
          this.loading = false;
        })
        .catch(error => {
          console.error(error);
          this.loading = false;
        });
    },
    goToParentDirectory() {
      if (this.directoryStack.length === 0) {
        return;
      }
      const previous = this.directoryStack.pop(); // 从栈中取出上一级目录
      this.directory = previous.directory; // 设置当前目录为上一级目录
      this.selectedDirectory = previous.selectedDirectory; // 设置选定的文件夹路径
    },
    submit() {
      if (!this.selectedDirectory) {
        alert('请先选择文件夹');
        return;
      }

      const files = this.directory.filter(item => !item.isDirectory);
      const supportedExtensions = ["txt", "doc", "docx", "pdf"];
      const selectedFiles = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return supportedExtensions.includes(extension);
      });

      if (selectedFiles.length === 0) {
        alert("所选文件夹中没有支持的文件类型（TXT、PDF、Word）！");
        return;
      }

      const data = {
        path: this.selectedDirectory.path, // 提交选定文件夹的路径
        files: selectedFiles // 提交选定文件夹中的支持的文件类型
      };

      console.log("----------------------4---------------")
      console.log(data);
      axios.post('http://127.0.0.1:5000/get_data', data)
        .then(response => {
          // 处理返回的数据
          alert("提交成功，请输入关键词进行检索！");
          console.log(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    },
    SearchFiles() {
      if (this.keywords.length===0) {
        alert("请输入关键词！");
        return;
      }

       this.loadingFiles = true; // 开始加载文件检索

      // 发起文件上传并检索请求
      const formData = new FormData();
      formData.append("keyword", this.keywords);

      axios
        .post("http://127.0.0.1:5000/search",formData)
        .then((response) =>{
          this.searchResult = response.data[1];
          this.searchResult.forEach((searchResult) =>{
            this.$set(searchResult, "selected", false);
          });
          console.log(response.data);
          console.log("----------------------------1-------------------");
          this.loadingFiles = false; // 加载文件检索完成
        })
        .catch((error) =>{
          alert("检索失败：" + error.message);
          console.error(error);
          this.loadingFiles = false; // 加载文件检索完成
        });
    },
    selectAllLines(searchResult) {
      const selected = searchResult.selected;
      for (const lines of searchResult.lines) {
        lines.selected = selected;
      }
    },
    updateSelectedLines(searchResult) {
      const allSelected = searchResult.lines.every((lines) =>lines.selected);
      searchResult.selected = allSelected;
    },
    saveData() {
      const selectedResults = [];
      for (const searchResult of this.searchResult) {
        const selectedLines = {};
        for (const lines of searchResult.lines) {
          if (lines.selected) {
            selectedLines[lines[0]] = lines[1];
          }
        }
        if (Object.keys(selectedLines).length >0) {
          selectedResults.push({
            path: searchResult.file,
            lines: selectedLines,
          });
        }
      }
      const jsonData = {
        results: selectedResults,
      };
      console.log(jsonData);

      // 发送 jsonData 给后端接口进行保存
      axios
        .post("http://127.0.0.1:5000/save", jsonData)
        .then((response) =>{
          console.log(response.data);
          console.log("----------------------------2-------------------");
        })
        .catch((error) =>{
          alert("文件保存失败：" + error.message);
        });
    },
    highlightKeyword(text, keyword) {
      console.log(keyword);
      const regex = new RegExp(keyword, 'gi'); // 创建正则表达式，忽略大小写
      return text.replace(regex, '<span class="highlighted">$&</span>'); // 将匹配的关键词用带有样式的HTML标签包围
    },
  },
};
</script>
