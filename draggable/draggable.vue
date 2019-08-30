<template>
    <div class="dra " :class="{'dra-tran':showtran}" :style="style" @mousedown="elementTouchDown" @touchstart="elementTouchDown">
        <slot></slot>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import dom from '../../utils/dom';

const events = {
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        stop: 'mouseup'
    },
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        stop: 'touchend'
    }
};

const userSelectNone = {
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    MsUserSelect: 'none'
};

const userSelectAuto = {
    userSelect: 'auto',
    MozUserSelect: 'auto',
    WebkitUserSelect: 'auto',
    MsUserSelect: 'auto'
};

@Component({
    name: 'draggable',
})
export default class Draggable extends Vue {

    @Prop(Number) private width !: number; // 宽
    @Prop(Number) private height !: number; // 高
    @Prop({ type: Number, default: 0 }) private x!: number; //初始x
    @Prop({ type: Number, default: 0 }) private y!: number; //初始y
    @Prop({ type: Number, default: 0 }) private scrollTop!: number; // 初始 scrollTop
    @Prop({ type: Boolean,default:true}) private draggable !:boolean; // 是否开启拖拽
    @Prop({ type: Boolean,default:true}) private adsorb !:boolean; // 是否开启吸附左右两侧
    @Prop({ type: Boolean,default:true}) private scrollHide !:boolean; // 是否开启滑动隐藏

    private rawWidth: number = 0; // 
    private rawHeight: number = 0; // 
    private rawLeft: number = 0; // 
    private rawTop: number = 0;
    private top: number = 0;
    private left: number = 0;
    private parentWidth: number = 0; //父级元素宽
    private parentHeight: number = 0; //父级元素高
    private eventsFor = events.mouse; // 监听事件
    private mouseClickPosition = { // 鼠标点击的当前位置
        mouseX: 0,
        mouseY: 0,
        left: 0,
        top: 0,
    };
    private bounds = {
        minLeft: 0,
        maxLeft: 0,
        minTop: 0,
        maxTop: 0,
    };
    private dragging: boolean = false;
    private showtran: boolean = false;
    private preScrollTop: number = 0;

    private mounted() {
        this.rawWidth = this.width;
        this.rawHeight = this.height;
        this.rawLeft = this.x;
        this.rawTop = this.y;
        this.left = this.x;
        this.top = this.y;
        [this.parentWidth, this.parentHeight] = this.getParentSize();
        // 对边界计算
        this.bounds = this.calcDragLimits();
    }

    private beforeDestroy(){
        dom.removeEvent(document.documentElement, 'touchstart', this.elementTouchDown);
        dom.removeEvent(document.documentElement, 'mousedown', this.elementTouchDown);

        dom.removeEvent(document.documentElement, 'touchmove', this.move);
        dom.removeEvent(document.documentElement, 'mousemove', this.move);

        dom.removeEvent(document.documentElement, 'mouseup', this.handleUp);
        dom.removeEvent(document.documentElement, 'touchend', this.handleUp);

    }

    private getParentSize() {
        const style = window.getComputedStyle(
            this.$el.parentNode as Element,
            null
        );

        return [
            parseInt(style.getPropertyValue('width'), 10),
            parseInt(style.getPropertyValue('height'), 10)
        ];

    }

    /**
     * 滑动区域计算
     */
    private calcDragLimits() {
        return {
            minLeft: 0,
            maxLeft: Math.floor(this.parentWidth - this.width),
            minTop: 0,
            maxTop: Math.floor(this.parentHeight - this.height),
        };
    }

    /**
     * 监听滑动开始
     */
    private elementTouchDown(e: TouchEvent) {
        if(this.draggable){
            this.eventsFor = events.touch;
            this.elementDown(e);
        }
    }

    private elementDown(e: TouchEvent | MouseEvent) {
        const target = e.target || e.srcElement;
        this.dragging = true;
        this.mouseClickPosition.left = this.left;
        this.mouseClickPosition.top = this.top;
        this.mouseClickPosition.mouseX = (e as TouchEvent).touches
            ? (e as TouchEvent).touches[0].pageX
            : (e as MouseEvent).pageX;
        this.mouseClickPosition.mouseY = (e as TouchEvent).touches
            ? (e as TouchEvent).touches[0].pageY
            : (e as MouseEvent).pageY;
        
        // 监听移动事件 结束事件
        dom.addEvent(document.documentElement, this.eventsFor.move, this.move);
        dom.addEvent(
            document.documentElement,
            this.eventsFor.stop,
            this.handleUp
        );
    }

    

    /**
     * 监听滑动过程
     */
    private move(e: TouchEvent | MouseEvent) {
        if(this.dragging){
            this.elementMove(e);
        }
    }

    private elementMove(e: TouchEvent | MouseEvent) {
        const mouseClickPosition = this.mouseClickPosition;

        const tmpDeltaX = mouseClickPosition.mouseX - ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].pageX : (e as MouseEvent).pageX) || 0;
        const tmpDeltaY = mouseClickPosition.mouseY - ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].pageY : (e as MouseEvent).pageY) || 0;

        if (!tmpDeltaX && !tmpDeltaY) return;
        this.rawTop = mouseClickPosition.top - tmpDeltaY;
        this.rawLeft = mouseClickPosition.left - tmpDeltaX;
        this.$emit('dragging', this.left, this.top);
    }

    /**
     * 监听滑动结束
     */
    private handleUp(e: TouchEvent | MouseEvent) {
        
        this.rawTop = this.top;
        this.rawLeft = this.left;

        if (this.dragging) {
            this.dragging = false;
            this.$emit('dragstop', this.left, this.top);
        }

        // 是否自动靠边
        if(this.adsorb){
            this.showtran = true
            const middleWidth = this.parentWidth / 2;
            if((this.left + this.width/2) < middleWidth){
                this.left = 0
            }else{
                this.left = this.bounds.maxLeft - 10
            }
            setTimeout(() => {
                this.showtran = false
            }, 400);
        }
        this.resetBoundsAndMouseState();

    }

    /**
     * 重置初始数据
     */
    private resetBoundsAndMouseState() {
        this.mouseClickPosition = {
            mouseX: 0,
            mouseY: 0,
            left: 0,
            top: 0,
        };
    }

    /**
     * 元素位置
     */
    private get style() {
        return {
            position: 'absolute',
            top: this.top + 'px',
            left: this.left + 'px',
            width: this.width + 'px',
            height: this.height + 'px',
            ...(this.dragging ? userSelectNone : userSelectAuto)
        };
    }

    @Watch('rawTop')
    private rawTopChange(newTop: number) {
        const bounds = this.bounds;
        if (bounds.maxTop === 0) {
            this.top = newTop;
            return;
        }
        const left = this.left;
        const top = this.top;
        if (bounds.minTop !== null && newTop < bounds.minTop) {
            newTop = bounds.minTop;
        } else if (bounds.maxTop !== null && bounds.maxTop < newTop) {
            newTop = bounds.maxTop;
        }

        this.top = newTop;
    }

    @Watch('rawLeft')
    private rawLeftChange(newLeft: number) {
        const bounds = this.bounds;
        if (bounds.maxTop === 0) {
            this.left = newLeft;
            return;
        }
        const left = this.left;
        const top = this.top;

        if (bounds.minLeft !== null && newLeft < bounds.minLeft) {
            newLeft = bounds.minLeft;
        } else if (bounds.maxLeft !== null && bounds.maxLeft < newLeft) {
            newLeft = bounds.maxLeft;
        }

        this.left = newLeft;
    }

    @Watch('scrollTop')
    private scorllTopChange(newTop:number){
        let timer = undefined;
        if(this.scrollHide){
            clearTimeout(timer);
            this.showtran = true;
            this.preScrollTop = newTop;
            this.left = this.bounds.maxLeft + this.width - 10
            timer = setTimeout(()=>{
                if(this.preScrollTop === newTop ){
                    this.left = this.bounds.maxLeft - 10;
                    setTimeout(()=>{
                       this.showtran = false;
                    },300)
                }
            },200)
        }
    }

} 
</script>
<style lang="scss" scoped>
.dra {
    touch-action: none;
}

.dra-tran {
    transition: top .2s ease-out , left .2s ease-out;
}

</style>


