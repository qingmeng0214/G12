(function(){"use strict";var e={152:function(e,t,r){var s=r(144),o=function(){var e=this,t=e._self._c;return t("div",[t("SearchFile")],1)},i=[],n=function(){var e=this,t=e._self._c;return t("div",{staticClass:"container"},[t("h2",[e._v("文件检索系统")]),e.loadingDrives?t("div",[e._v("加载硬盘中...")]):t("div",[t("div",[e.directoryStack.length>0?t("a",{attrs:{href:"#"},on:{click:e.goToParentDirectory}},[e._v("返回上级目录")]):e._e(),t("br"),e.directoryStack.length>0?t("span",[e._v("当前文件夹"+e._s(e.selectedDirectory.path))]):e._e()]),t("div",{staticClass:"directory-list"},[t("ul",e._l(e.directory,(function(r){return t("li",{key:r.path},[r.isDirectory?t("a",{attrs:{href:"#"},on:{click:function(t){return e.enterDirectory(r.path)}}},[e._v(e._s(r.name))]):t("span",[e._v(e._s(r.name))])])})),0)]),t("div",[t("button",{on:{click:e.submit}},[e._v("提交")])])]),t("div",{staticClass:"input-container"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.keywords,expression:"keywords"}],attrs:{type:"text",placeholder:"输入关键词"},domProps:{value:e.keywords},on:{input:function(t){t.target.composing||(e.keywords=t.target.value)}}}),t("button",{staticClass:"upload-button",on:{click:e.SearchFiles}},[e._v(" 开始检索 ")]),t("button",{staticClass:"save-button",on:{click:e.saveData}},[e._v("保存选中文件")])]),t("h2",[e._v("检索结果：")]),e.loadingFiles?t("div",[e._v("加载检索结果中...")]):e._e(),!e.loadingFiles&&e.searchResult.length?t("div",{class:"search-result directory-list"},e._l(e.searchResult,(function(r){return t("div",{key:r.file},[t("h2",[t("label",{staticClass:"file-label"},[t("input",{directives:[{name:"model",rawName:"v-model",value:r.selected,expression:"searchResult.selected"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(r.selected)?e._i(r.selected,null)>-1:r.selected},on:{change:[function(t){var s=r.selected,o=t.target,i=!!o.checked;if(Array.isArray(s)){var n=null,c=e._i(s,n);o.checked?c<0&&e.$set(r,"selected",s.concat([n])):c>-1&&e.$set(r,"selected",s.slice(0,c).concat(s.slice(c+1)))}else e.$set(r,"selected",i)},function(t){return e.selectAllLines(r)}]}}),e._v(" "+e._s(r.file)+" ")])]),t("ul",e._l(r.lines,(function(s){return t("li",{key:s},[t("label",[t("input",{directives:[{name:"model",rawName:"v-model",value:s.selected,expression:"lines.selected"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(s.selected)?e._i(s.selected,null)>-1:s.selected},on:{change:[function(t){var r=s.selected,o=t.target,i=!!o.checked;if(Array.isArray(r)){var n=null,c=e._i(r,n);o.checked?c<0&&e.$set(s,"selected",r.concat([n])):c>-1&&e.$set(s,"selected",r.slice(0,c).concat(r.slice(c+1)))}else e.$set(s,"selected",i)},function(t){return e.updateSelectedLines(r)}]}}),t("span",[e._v("行号: "+e._s(s[0])+"----")]),t("span",{domProps:{innerHTML:e._s(e.highlightKeyword(s[1],e.keywords))}})])])})),0)])})),0):e._e()])},c=[],l=(r(7658),r(6154)),a={name:"SearchFile",data(){return{loadingDrives:!1,loadingFiles:!1,directoryStack:[],directory:[],selectedDirectory:null,searchResult:[],keywords:""}},mounted(){this.getDrives()},methods:{getDrives(){this.loadingDrives=!0,l.Z.get("http://127.0.0.1:5000/api/getDrives").then((e=>{console.log("---------------------1------------------"),console.log(e.data),this.directory=e.data.map((e=>({name:e,isDirectory:!0,path:e}))),this.loadingDrives=!1})).catch((e=>{console.error(e),this.loadingDrives=!1}))},enterDirectory(e){this.loading=!0,this.selectedFiles=[],l.Z.post("http://127.0.0.1:5000/api/getDirectory",{path:e}).then((t=>{console.log("---------------------2------------------"),console.log(t.data),this.directoryStack.push({directory:this.directory,selectedDirectory:this.selectedDirectory}),this.directory=t.data.map((e=>({...e,selected:!1}))),this.selectedDirectory={path:e},this.loading=!1})).catch((e=>{console.error(e),this.loading=!1}))},goToParentDirectory(){if(0===this.directoryStack.length)return;const e=this.directoryStack.pop();this.directory=e.directory,this.selectedDirectory=e.selectedDirectory},submit(){if(!this.selectedDirectory)return void alert("请先选择文件夹");const e=this.directory.filter((e=>!e.isDirectory)),t=["txt","doc","docx","pdf"],r=e.filter((e=>{const r=e.name.split(".").pop().toLowerCase();return t.includes(r)}));if(0===r.length)return void alert("所选文件夹中没有支持的文件类型（TXT、PDF、Word）！");const s={path:this.selectedDirectory.path,files:r};console.log("----------------------4---------------"),console.log(s),l.Z.post("http://127.0.0.1:5000/get_data",s).then((e=>{alert("提交成功，请输入关键词进行检索！"),console.log(e.data)})).catch((e=>{console.error(e)}))},SearchFiles(){if(0===this.keywords.length)return void alert("请输入关键词！");this.loadingFiles=!0;const e=new FormData;e.append("keyword",this.keywords),l.Z.post("http://127.0.0.1:5000/search",e).then((e=>{this.searchResult=e.data[1],this.searchResult.forEach((e=>{this.$set(e,"selected",!1)})),console.log(e.data),console.log("----------------------------1-------------------"),this.loadingFiles=!1})).catch((e=>{alert("检索失败："+e.message),console.error(e),this.loadingFiles=!1}))},selectAllLines(e){const t=e.selected;for(const r of e.lines)r.selected=t},updateSelectedLines(e){const t=e.lines.every((e=>e.selected));e.selected=t},saveData(){const e=[];for(const r of this.searchResult){const t={};for(const e of r.lines)e.selected&&(t[e[0]]=e[1]);Object.keys(t).length>0&&e.push({path:r.file,lines:t})}const t={results:e};console.log(t),l.Z.post("http://127.0.0.1:5000/save",t).then((e=>{console.log(e.data),console.log("----------------------------2-------------------")})).catch((e=>{alert("文件保存失败："+e.message)}))},highlightKeyword(e,t){console.log(t);const r=new RegExp(t,"gi");return e.replace(r,'<span class="highlighted">$&</span>')}}},d=a,h=r(1001),u=(0,h.Z)(d,n,c,!1,null,null,null),p=u.exports,v={name:"App",components:{SearchFile:p}},f=v,y=(0,h.Z)(f,o,i,!1,null,null,null),g=y.exports;s.ZP.prototype.$axios=l.Z,s.ZP.config.productionTip=!1,new s.ZP({render:e=>e(g)}).$mount("#app")}},t={};function r(s){var o=t[s];if(void 0!==o)return o.exports;var i=t[s]={exports:{}};return e[s].call(i.exports,i,i.exports,r),i.exports}r.m=e,function(){var e=[];r.O=function(t,s,o,i){if(!s){var n=1/0;for(d=0;d<e.length;d++){s=e[d][0],o=e[d][1],i=e[d][2];for(var c=!0,l=0;l<s.length;l++)(!1&i||n>=i)&&Object.keys(r.O).every((function(e){return r.O[e](s[l])}))?s.splice(l--,1):(c=!1,i<n&&(n=i));if(c){e.splice(d--,1);var a=o();void 0!==a&&(t=a)}}return t}i=i||0;for(var d=e.length;d>0&&e[d-1][2]>i;d--)e[d]=e[d-1];e[d]=[s,o,i]}}(),function(){r.d=function(e,t){for(var s in t)r.o(t,s)&&!r.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})}}(),function(){r.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={143:0};r.O.j=function(t){return 0===e[t]};var t=function(t,s){var o,i,n=s[0],c=s[1],l=s[2],a=0;if(n.some((function(t){return 0!==e[t]}))){for(o in c)r.o(c,o)&&(r.m[o]=c[o]);if(l)var d=l(r)}for(t&&t(s);a<n.length;a++)i=n[a],r.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return r.O(d)},s=self["webpackChunkvue_test"]=self["webpackChunkvue_test"]||[];s.forEach(t.bind(null,0)),s.push=t.bind(null,s.push.bind(s))}();var s=r.O(void 0,[998],(function(){return r(152)}));s=r.O(s)})();
//# sourceMappingURL=app.a8065b75.js.map