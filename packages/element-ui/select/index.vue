<template>
  <component :is="componentName"
             ref="main"
             :class="b()"
             v-model="text"
             :size="size"
             :options="options"
             :loading="loading"
             :loading-text="loadingText"
             :multiple="multiple"
             :filterable="remote?true:filterable"
             :remote="remote"
             :readonly="readonly"
             :no-match-text="noMatchText"
             :no-data-text="noDataText"
             :remote-method="remote?handleRemoteMethod:undefined"
             :popper-class="popperClass"
             :popper-append-to-body="popperAppendToBody"
             :collapse-tags="tags || collapseTags"
             :collapse-tags-tooltip="collapseTagsTooltip"
             :max-collapse-tags="maxCollapseTags"
             :clearable="clearableVal"
             :placeholder="placeholder"
             @focus="handleFocus"
             @blur="handleBlur"
             @click="handleClick"
             :multiple-limit="limit"
             :allow-create="allowCreate"
             :default-first-option="defaultFirstOption"
             :disabled="disabled">
    <template #="{item}">
      <template v-if="virtualize">
        <slot :label="labelKey"
              :value="valueKey"
              :item="item"
              v-if="$slots.default">
        </slot>
        <template v-else>
          <span>{{ getLabelText(item) }}</span>
          <span v-if="item[descKey]"
                :class="b('desc')">{{ item[descKey] }}</span>
        </template>
      </template>
      <template v-else>
        <template v-if="isGroup">
          <el-option-group v-for="(item,index) in netDic"
                           :key="index"
                           :label="getLabelText(item)">
            <el-option v-for="(citem,cindex) in item[groupsKey]"
                       :key="cindex"
                       :disabled="citem[disabledKey]"
                       :label="getLabelText(citem)"
                       :value="citem[valueKey]">
              <template #>
                <slot :label="labelKey"
                      :value="valueKey"
                      :item="citem"
                      v-if="$slots.default">
                </slot>
                <template v-else>
                  <span>{{ getLabelText(citem) }}</span>
                  <span v-if="citem[descKey]"
                        :class="b('desc')">{{ citem[descKey] }}</span>
                </template>
              </template>
            </el-option>
          </el-option-group>
        </template>
        <template v-else>
          <div :class="b('check')">
            <el-checkbox v-if="all&&multiple"
                         :value="checked"
                         :checked="checked"
                         :disabled="disabled"
                         :indeterminate="indeterminate"
                         @change='checkChange'>全选</el-checkbox>
          </div>

          <el-option v-for="(item,index) in netDic"
                     :key="index"
                     :disabled="item[disabledKey]"
                     :label="getLabelText(item) "
                     :value="item[valueKey]">

            <template #>
              <slot :label="labelKey"
                    :value="valueKey"
                    :item="item"
                    v-if="$slots.default">
              </slot>
              <template v-else>
                <span>{{ getLabelText(item) }}</span>
                <span v-if="item[descKey]"
                      :class="b('desc')">{{ item[descKey] }}</span>
              </template>
            </template>
          </el-option>
        </template>
      </template>
    </template>

  </component>
</template>

<script>
import packages from 'core/packages';
import create from "core/create";
import props from "common/common/props.js";
import event from "common/common/event.js";
import { sendDic } from "core/dic";
import { DIC_SPLIT } from 'global/variable';
export default create({
  name: "select",
  mixins: [props(), event()],
  data () {
    return {
      checked: false,
      indeterminate: false,
      create: false,
      netDic: [],
      loading: false,
    };
  },
  props: {
    virtualize: Boolean,
    loadingText: {
      type: String,
    },
    noMatchText: {
      type: String,
    },
    noDataText: {
      type: String,
    },
    drag: {
      type: Boolean,
      default: false
    },
    remote: {
      type: Boolean,
      default: false
    },
    tags: {
      type: Boolean,
      default: false
    },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: Number,
    limit: {
      type: Number,
      default: 0
    },
    filterable: {
      type: Boolean,
      default: false
    },
    allowCreate: {
      type: Boolean,
      default: false
    },
    defaultFirstOption: {
      type: Boolean,
      default: false
    },
    all: {
      type: Boolean,
      default: false
    },
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    dic: {
      handler (val) {
        this.netDic = val;
      },
      immediate: true
    }
  },
  computed: {
    options () {
      let dicData = this.deepClone(this.netDic)
      return dicData.map(ele => {
        return Object.assign(ele, {
          label: ele[this.labelKey],
          value: ele[this.valueKey],
          disabled: ele[this.disabledKey]
        })
      })
    },
    componentName () {
      return 'elSelect' + (this.virtualize ? 'V2' : '')
    }
  },
  mounted () {
    if (this.drag) {
      this.setSort()
    }
  },
  methods: {
    handleModelValue (val) {
      if (!this.validatenull(this.text)) {
        if (this.remote && !this.created) {
          this.created = true
          this.handleRemoteMethod(this.multiple ? this.text.join(DIC_SPLIT) : this.text)
        }
      }
      if (this.multiple) {
        if (this.text.length == 0) {
          this.checked = false
          this.indeterminate = false
        } else if (this.text.length == this.netDic.length) {
          this.checked = true
          this.indeterminate = false
        } else {
          this.checked = false
          this.indeterminate = true
        }
      }
    },
    setSort () {
      if (!window.Sortable) {
        packages.logs('Sortable');
        return
      }
      const el = this.$refs.main.$el.querySelectorAll('.el-select__tags > span')[0]
      this.sortable = window.Sortable.create(el, {
        animation: 100,
        delay: 200,
        onEnd: evt => {
          const targetRow = this.modelValue.splice(evt.oldIndex, 1)[0]
          this.modelValue.splice(evt.newIndex, 0, targetRow)
        }
      })
    },
    handleRemoteMethod (query) {
      this.loading = true;
      sendDic({
        column: this.column,
        value: query,
      }).then(res => {
        this.loading = false;
        this.netDic = res;
      });
    },
    checkChange (val) {
      this.text = []
      this.checked = val
      this.indeterminate = false
      if (val) {
        this.text = this.netDic.map(ele => ele[this.valueKey])
      }
    }
  }
});
</script>