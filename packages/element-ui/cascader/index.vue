<template>
  <el-cascader ref="cascader" 
               :options="dic"
               :class="b()"
               @click="handleClick"
               @change="handleValueChange"
               v-model="text"
               :placeholder="placeholder"
               :props="allProps"
               :size="size"
               :clearable="clearableVal"
               :show-all-levels="showAllLevels"
               :filterable="filterable"
               :popper-class="popperClass"
               :separator="separator"
               :disabled="disabled"
               :collapse-tags="tags || collapseTags"
               :collapse-tags-tooltip="collapseTagsTooltip"
               :max-collapse-tags="maxCollapseTags"
               @focus="handleFocus"
               @blur="handleBlur">
    <template #="{data,node}">
      <slot v-if="$slots.default"
            :data="data"
            :node="node"></slot>
      <span v-else>{{data[labelKey]}}</span>
    </template>
  </el-cascader>
</template>

<script>
import create from "core/create";
import props from "common/common/props.js";
import event from "common/common/event.js";
export default create({
  name: "cascader",
  mixins: [props(), event()],
  props: {
    checkStrictly: {
      type: Boolean,
      default: false
    },
    emitPath: {
      type: Boolean,
      default: true
    },
    tags: {
      type: Boolean,
      default: false
    },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: Number,
    modelValue: {
      type: [Array, String],
      default: () => []
    },
    expandTrigger: {
      type: String,
      default: "hover"
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    lazy: {
      type: Boolean,
      default: false
    },
    lazyLoad: Function,
    filterable: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String
    }
  },
  computed: {
    allProps () {
      return {
        label: this.labelKey,
        value: this.valueKey,
        children: this.childrenKey,
        checkStrictly: this.checkStrictly,
        multiple: this.multiple,
        emitPath: this.emitPath,
        lazy: this.lazy,
        lazyLoad: (node, resolve) => {
          let callback = (list) => {
            let findDic = (list, value, children) => {
              list.forEach(ele => {
                if (ele[this.valueKey] == value) {
                  ele[this.childrenKey] = children
                } else if (ele[this.childrenKey]) {
                  findDic(ele[this.childrenKey])
                }
              })
            }
            findDic(this.dic, node[this.valueKey], list)
            resolve(list);
          }
          this.lazyLoad && this.lazyLoad(node, callback)
        },
        expandTrigger: this.expandTrigger
      }
    }
  },
  created () { },
  mounted () { },
  methods: {
    getCheckedNodes (leafOnly = false) {
      return this.$refs.cascader.getCheckedNodes(leafOnly)
    },
    handleValueChange (val) {
      this.$nextTick(() => {
        let $parent = this.$parent.$parent
        if (!this.validatenull(val) && $parent && this.rules) {
          $parent?.clearValidate()
        } else if (this.validatenull(val)) {
          $parent?.validate();
        }
      })
    },
  }
});
</script>
