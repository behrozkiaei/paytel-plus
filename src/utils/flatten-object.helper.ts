export const  flattenObject = (obj: any) => {
    const result: any[] = [];
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          // console.log(obj[key])
          const temp = flattenObject(obj[key]);
          for (const innerKey in temp) {
            result.push({ key: `${innerKey}`, value: temp[innerKey] });
          }
        } else if (Array.isArray(obj[key])) {
          for (const element of obj[key]) {
            result.push({ key: 'separator', value: '3-4' });
            const temp = flattenObject(element);
            for (const innerKey in temp) {
              if (
                typeof temp[innerKey].value === 'object' &&
                !Array.isArray(temp[innerKey].value)
              ) {
                result.push({
                  key: `${temp[innerKey].value.key}`,
                  value: temp[innerKey].value.value,
                });
              } else if (Array.isArray(temp[innerKey].value)) {
              } else {
                result.push({
                  key: `${temp[innerKey].key}`,
                  value: temp[innerKey].value,
                });
              }
            }
          }
        } else {
          result.push({ key: key, value: obj[key] });
        }
      }
    }else if (Array.isArray(obj)) {
      for (const element of obj) {
        const temp = flattenObject(element);
        for (const innerKey in temp) {
          if (
            typeof temp[innerKey].value === 'object' &&
            !Array.isArray(temp[innerKey].value)
          ) {
            result.push({
              key: `${temp[innerKey].value.key}`,
              value: temp[innerKey].value.value,
            });
          } else if (Array.isArray(temp[innerKey].value)) {
          } else {
            result.push({
              key: `${temp[innerKey].key}`,
              value: temp[innerKey].value,
            });
          }
        }
        result.push({ key: 'separator', value: 'separator' });
      }
    }
    return result;
  }