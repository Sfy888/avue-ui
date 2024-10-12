import { validatenull } from 'utils/validate';
import { KEY_COMPONENT_NAME, DIC_SPLIT, ARRAY_LIST, DATE_LIST, INPUT_LIST, ARRAY_VALUE_LIST, MULTIPLE_LIST, SELECT_LIST, RANGE_LIST } from 'global/variable';
import { detailDataType, findObject, createObj } from 'utils/util';
import { t } from 'locale';
/**
 * 计算级联属性
 */
export const calcCascader = (list = []) => {
  list.forEach(ele => {
    let cascader = ele.cascader
    if (!validatenull(cascader)) {
      let parentProp = ele.prop;
      cascader.forEach(citem => {
        let column = findObject(list, citem);
        if (column) column.parentProp = parentProp;
      });
    }
  });
  return list;
};
/**
 * 计算空白列row
 */
let count = 0;
export const calcCount = (ele, spanDefault = 12, init = false) => {
  if (init) count = 0;
  const spanAll = 24;
  count = count + (ele.span || spanDefault) + (ele.offset || 0);
  if (count === spanAll) {
    count = 0;
  } else if (count > spanAll) {
    count = 0 + (ele.span || spanDefault) + (ele.offset || 0);
  } else if (ele.row && count !== spanAll) {
    ele.count = spanAll - count;
    count = 0;
  }
  return ele;
};

/**
 * 初始化数据格式
 */
export const initVal = (value, safe) => {
  let { type, multiple, dataType, separator = DIC_SPLIT, alone, emitPath, range } = safe
  let list = value;
  if (
    (MULTIPLE_LIST.includes(type) && multiple == true) ||
    (ARRAY_VALUE_LIST.includes(type) && emitPath !== false) ||
    (RANGE_LIST.includes(type) && range == true)
  ) {
    if (!Array.isArray(list)) {
      if (validatenull(list)) {
        list = [];
      } else {
        list = (list + '').split(separator) || [];
      }
    }
    // 数据转化
    list.forEach((ele, index) => {
      list[index] = detailDataType(ele, dataType);
    });
    if (ARRAY_LIST.includes(type) && validatenull(list) && alone) list = [''];
  } else {
    list = detailDataType(list, dataType)
  }
  return list;
};

/**
 * 搜索框获取动态组件
 */
export const getSearchType = (column) => {
  const type = column.type;
  const range = column.searchRange;
  let result = type;
  if (column.searchType) return column.searchType;
  if (['radio', 'checkbox', 'switch'].includes(type)) {
    result = 'select';
  } else if (DATE_LIST.includes(type)) {
    let rangeKey = 'range';
    if (range) {
      if (!type.includes(rangeKey)) {
        result = type + rangeKey;
      } else {
        result = type;
      }
    } else result = type.replace(rangeKey, '');
  } else if (['textarea'].includes(type)) {
    result = 'input';
  }
  return result;
};

/**
 * 动态获取组件
 */
export const getComponent = (type, component) => {
  let result = type || 'input';
  if (!validatenull(component)) {
    return component;
  } else if (ARRAY_LIST.includes(type)) {
    result = 'array';
  } else if (['time', 'timerange'].includes(type)) {
    result = 'time';
  } else if (DATE_LIST.includes(type)) {
    result = 'date';
  } else if (['password', 'textarea', 'search'].includes(type)) {
    result = 'input';
  } else if (INPUT_LIST.includes(type)) {
    result = 'input-' + type;
  }
  return KEY_COMPONENT_NAME + result;
};

/**
 * 表格初始化值
 */

export const formInitVal = (list = []) => {
  let tableForm = {};
  list.forEach(ele => {
    if (
      ['rate', 'slider', 'number'].includes(ele.type) ||
      ele.dataType === 'number' ||
      (ele.type == 'select' && ele.virtualize == true)
    ) {
      tableForm[ele.prop] = undefined;
    } else if (
      ARRAY_VALUE_LIST.includes(ele.type) ||
      (MULTIPLE_LIST.includes(ele.type) && ele.multiple) || ele.dataType === 'array'
    ) {
      tableForm[ele.prop] = [];
    } else if (RANGE_LIST.includes(ele.type) && ele.range == true) {
      tableForm[ele.prop] = [0, 0]
    } else {
      tableForm[ele.prop] = '';
    }
    if (ele.bind) {
      tableForm = createObj(tableForm, ele.bind);
    }
    // 表单默认值设置
    if (!validatenull(ele.value)) {
      tableForm[ele.prop] = ele.value;
    }
  });
  return tableForm

};

export const getPlaceholder = function (column, type) {
  const placeholder = column.placeholder;
  const label = column.label;
  if (type === 'search') {
    const searchPlaceholder = column.searchPlaceholder;
    if (!validatenull(searchPlaceholder)) {
      return searchPlaceholder;
    } else {
      return label;
    }
  } else if (validatenull(placeholder)) {
    if (SELECT_LIST.includes(column.type)) {
      return `${t('tip.select')} ${label}`;
    } else {
      return `${t('tip.input')} ${label}`;
    }
  }

  return placeholder;
};
