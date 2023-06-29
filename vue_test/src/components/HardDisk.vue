<template>
    <div>
        <h2>文件检索系统</h2>
        <div v-if="loading">加载中...</div>
        <div v-else>
            <div>
                <a v-if="directoryStack.length > 0" href="#" @click="goToParentDirectory">返回上级目录</a>
            </div>
            <ul class="directory-list">
                <li v-for="item in directory" :key="item.path">
                <a v-if="item.isDirectory" href="#" @click="enterDirectory(item.path)">{{ item.name }}</a>
                <span v-else>{{ item.name }}</span>
                </li>
            </ul>
            <div>
                <button @click="submit">提交</button>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            directoryStack: [], // 用于保存目录路径的栈
            directory: [],
            loading: false,
            selectedDirectory: null, // 选择的文件夹
        };
    },
    mounted() {
        this.getDrives();
    },
    methods: {
        getDrives() {
            this.loading = true;
            axios.get('http://127.0.0.1:5000/api/getDrives')
                .then(response => {
                    console.log("---------------------1------------------")
                    console.log(response.data);
                    this.directory = response.data.map(drive => ({
                        name: drive,
                        isDirectory: true,
                        path: drive
                    }));
                    this.loading = false;
                })
                .catch(error => {
                    console.error(error);
                    this.loading = false;
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
        selectFile(file) {
            if (this.selectedFiles.find(f => f.path === file.path)) {
                // 文件已经被选择，取消选择
                this.selectedFiles = this.selectedFiles.filter(f => f.path !== file.path);
            } else {
                // 文件未被选择，添加到选择列表中
                this.selectedFiles.push(file);
            }
        },
        submit() {
            if (!this.selectedDirectory) {
                alert('请先选择文件夹');
                return;
            }

            const data = {
                path: this.selectedDirectory.path, // 提交选定文件夹的路径
                files: this.directory.filter(item => !item.isDirectory) // 提交选定文件夹中的所有文件
            };

            console.log("----------------------4---------------")
            console.log(data);
            axios.post('http://127.0.0.1:5000/get_data', data)
                .then(response => {
                    // 处理返回的数据
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }
};
</script>

<style>
.directory-list {
    overflow-y: auto;
    max-height: 400px;
    /* 调整最大高度根据需要 */
}
</style>
