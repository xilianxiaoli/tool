<template>
    <div class="home-page" @scroll.passive="homePageScroll">
        <div class="drogue" v-if="dragData.imageUrl">
            <draggable
                :width="50"
                :height="50"
                :x="drogueLeft"
                :y="427"
                :scrollTop="scrollTop"
                :draggable="dragData.draggable"
                :scrollHide="dragData.scrollHide"
            >
                <div class="drag-item" :style="dragStyle" @click="dragClick"></div>
            </draggable>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default class Home extends Vue {
    /**
         * 监听页面滚动
         */
    private homePageScroll(e: any) {
        this.scrollTop = e.target.scrollTop;
    }

    /**
     * 浮标点击事件
     */
    private dragClick() {
        this.dragData.link && (window.location.href = this.dragData.link);
    }
}
</script>

