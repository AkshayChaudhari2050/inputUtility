(function() {
  var callWithJQuery,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    hasProp = {}.hasOwnProperty;

  callWithJQuery = function(pivotModule) {
    if (typeof exports === "object" && typeof module === "object") {
      return pivotModule(require("jquery"));
    } else if (typeof define === "function" && define.amd) {
      return define(["jquery"], pivotModule);
    } else {
      return pivotModule(jQuery);
    }
  };

  callWithJQuery(function($) {

    /*
    Utilities
     */
    var PivotData, addSeparators, aggregatorTemplates, aggregators, dayNamesEn, derivers, getSort, locales, mthNamesEn, naturalSort, numberFormat, pivotTableRenderer, rd, renderers, rx, rz, sortAs, usFmt, usFmtInt, usFmtPct, zeroPad;
    addSeparators = function(nStr, thousandsSep, decimalSep) {
      var rgx, x, x1, x2;
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? decimalSep + x[1] : '';
      rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + thousandsSep + '$2');
      }
      return x1 + x2;
    };
    numberFormat = function(opts) {
      var defaults;
      defaults = {
        digitsAfterDecimal: 2,
        scaler: 1,
        thousandsSep: ",",
        decimalSep: ".",
        prefix: "",
        suffix: ""
      };
      opts = $.extend({}, defaults, opts);
      return function(x) {
        var result;
        if (isNaN(x) || !isFinite(x)) {
          return "";
        }
        result = addSeparators((opts.scaler * x).toFixed(opts.digitsAfterDecimal), opts.thousandsSep, opts.decimalSep);
        return "" + opts.prefix + result + opts.suffix;
      };
    };
    usFmt = numberFormat();
    usFmtInt = numberFormat({
      digitsAfterDecimal: 0
    });
    usFmtPct = numberFormat({
      digitsAfterDecimal: 1,
      scaler: 100,
      suffix: "%"
    });
    aggregatorTemplates = {
      count: function(formatter) {
        if (formatter == null) {
          formatter = usFmtInt;
        }
        return function() {
          return function(data, rowKey, colKey) {
            return {
              count: 0,
              push: function() {
                return this.count++;
              },
              value: function() {
                return this.count;
              },
              format: formatter
            };
          };
        };
      },
      uniques: function(fn, formatter) {
        if (formatter == null) {
          formatter = usFmtInt;
        }
        return function(arg) {
          var attr;
          attr = arg[0];
          return function(data, rowKey, colKey) {
            return {
              uniq: [],
              push: function(record) {
                var ref;
                if (ref = record[attr], indexOf.call(this.uniq, ref) < 0) {
                  return this.uniq.push(record[attr]);
                }
              },
              value: function() {
                return fn(this.uniq);
              },
              format: formatter,
              numInputs: attr != null ? 0 : 1
            };
          };
        };
      },
      sum: function(formatter) {
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var attr;
          attr = arg[0];
          return function(data, rowKey, colKey) {
            return {
              sum: 0,
              push: function(record) {
                if (!isNaN(parseFloat(record[attr]))) {
                  return this.sum += parseFloat(record[attr]);
                }
              },
              value: function() {
                return this.sum;
              },
              format: formatter,
              numInputs: attr != null ? 0 : 1
            };
          };
        };
      },
      extremes: function(mode, formatter) {
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var attr;
          attr = arg[0];
          return function(data, rowKey, colKey) {
            return {
              val: null,
              sorter: getSort(data != null ? data.sorters : void 0, attr),
              push: function(record) {
                var ref, ref1, ref2, x;
                x = record[attr];
                if (mode === "min" || mode === "max") {
                  x = parseFloat(x);
                  if (!isNaN(x)) {
                    this.val = Math[mode](x, (ref = this.val) != null ? ref : x);
                  }
                }
                if (mode === "first") {
                  if (this.sorter(x, (ref1 = this.val) != null ? ref1 : x) <= 0) {
                    this.val = x;
                  }
                }
                if (mode === "last") {
                  if (this.sorter(x, (ref2 = this.val) != null ? ref2 : x) >= 0) {
                    return this.val = x;
                  }
                }
              },
              value: function() {
                return this.val;
              },
              format: function(x) {
                if (isNaN(x)) {
                  return x;
                } else {
                  return formatter(x);
                }
              },
              numInputs: attr != null ? 0 : 1
            };
          };
        };
      },
      quantile: function(q, formatter) {
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var attr;
          attr = arg[0];
          return function(data, rowKey, colKey) {
            return {
              vals: [],
              push: function(record) {
                var x;
                x = parseFloat(record[attr]);
                if (!isNaN(x)) {
                  return this.vals.push(x);
                }
              },
              value: function() {
                var i;
                if (this.vals.length === 0) {
                  return null;
                }
                this.vals.sort(function(a, b) {
                  return a - b;
                });
                i = (this.vals.length - 1) * q;
                return (this.vals[Math.floor(i)] + this.vals[Math.ceil(i)]) / 2.0;
              },
              format: formatter,
              numInputs: attr != null ? 0 : 1
            };
          };
        };
      },
      runningStat: function(mode, ddof, formatter) {
        if (mode == null) {
          mode = "mean";
        }
        if (ddof == null) {
          ddof = 1;
        }
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var attr;
          attr = arg[0];
          return function(data, rowKey, colKey) {
            return {
              n: 0.0,
              m: 0.0,
              s: 0.0,
              push: function(record) {
                var m_new, x;
                x = parseFloat(record[attr]);
                if (isNaN(x)) {
                  return;
                }
                this.n += 1.0;
                if (this.n === 1.0) {
                  return this.m = x;
                } else {
                  m_new = this.m + (x - this.m) / this.n;
                  this.s = this.s + (x - this.m) * (x - m_new);
                  return this.m = m_new;
                }
              },
              value: function() {
                if (mode === "mean") {
                  if (this.n === 0) {
                    return 0 / 0;
                  } else {
                    return this.m;
                  }
                }
                if (this.n <= ddof) {
                  return 0;
                }
                switch (mode) {
                  case "var":
                    return this.s / (this.n - ddof);
                  case "stdev":
                    return Math.sqrt(this.s / (this.n - ddof));
                }
              },
              format: formatter,
              numInputs: attr != null ? 0 : 1
            };
          };
        };
      },
      sumOverSum: function(formatter) {
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var denom, num;
          num = arg[0], denom = arg[1];
          return function(data, rowKey, colKey) {
            return {
              sumNum: 0,
              sumDenom: 0,
              push: function(record) {
                if (!isNaN(parseFloat(record[num]))) {
                  this.sumNum += parseFloat(record[num]);
                }
                if (!isNaN(parseFloat(record[denom]))) {
                  return this.sumDenom += parseFloat(record[denom]);
                }
              },
              value: function() {
                return this.sumNum / this.sumDenom;
              },
              format: formatter,
              numInputs: (num != null) && (denom != null) ? 0 : 2
            };
          };
        };
      },
      sumOverSumBound80: function(upper, formatter) {
        if (upper == null) {
          upper = true;
        }
        if (formatter == null) {
          formatter = usFmt;
        }
        return function(arg) {
          var denom, num;
          num = arg[0], denom = arg[1];
          return function(data, rowKey, colKey) {
            return {
              sumNum: 0,
              sumDenom: 0,
              push: function(record) {
                if (!isNaN(parseFloat(record[num]))) {
                  this.sumNum += parseFloat(record[num]);
                }
                if (!isNaN(parseFloat(record[denom]))) {
                  return this.sumDenom += parseFloat(record[denom]);
                }
              },
              value: function() {
                var sign;
                sign = upper ? 1 : -1;
                return (0.821187207574908 / this.sumDenom + this.sumNum / this.sumDenom + 1.2815515655446004 * sign * Math.sqrt(0.410593603787454 / (this.sumDenom * this.sumDenom) + (this.sumNum * (1 - this.sumNum / this.sumDenom)) / (this.sumDenom * this.sumDenom))) / (1 + 1.642374415149816 / this.sumDenom);
              },
              format: formatter,
              numInputs: (num != null) && (denom != null) ? 0 : 2
            };
          };
        };
      },
      fractionOf: function(wrapped, type, formatter) {
        if (type == null) {
          type = "total";
        }
        if (formatter == null) {
          formatter = usFmtPct;
        }
        return function() {
          var x;
          x = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return function(data, rowKey, colKey) {
            return {
              selector: {
                total: [[], []],
                row: [rowKey, []],
                col: [[], colKey]
              }[type],
              inner: wrapped.apply(null, x)(data, rowKey, colKey),
              push: function(record) {
                return this.inner.push(record);
              },
              format: formatter,
              value: function() {
                return this.inner.value() / data.getAggregator.apply(data, this.selector).inner.value();
              },
              numInputs: wrapped.apply(null, x)().numInputs
            };
          };
        };
      }
    };
    aggregatorTemplates.countUnique = function(f) {
      return aggregatorTemplates.uniques((function(x) {
        return x.length;
      }), f);
    };
    aggregatorTemplates.listUnique = function(s) {
      return aggregatorTemplates.uniques((function(x) {
        return x.sort(naturalSort).join(s);
      }), (function(x) {
        return x;
      }));
    };
    aggregatorTemplates.max = function(f) {
      return aggregatorTemplates.extremes('max', f);
    };
    aggregatorTemplates.min = function(f) {
      return aggregatorTemplates.extremes('min', f);
    };
    aggregatorTemplates.first = function(f) {
      return aggregatorTemplates.extremes('first', f);
    };
    aggregatorTemplates.last = function(f) {
      return aggregatorTemplates.extremes('last', f);
    };
    aggregatorTemplates.median = function(f) {
      return aggregatorTemplates.quantile(0.5, f);
    };
    aggregatorTemplates.average = function(f) {
      return aggregatorTemplates.runningStat("mean", 1, f);
    };
    aggregatorTemplates["var"] = function(ddof, f) {
      return aggregatorTemplates.runningStat("var", ddof, f);
    };
    aggregatorTemplates.stdev = function(ddof, f) {
      return aggregatorTemplates.runningStat("stdev", ddof, f);
    };
    aggregators = (function(tpl) {
      return {
        "Count": tpl.count(usFmtInt),
        "Count Unique Values": tpl.countUnique(usFmtInt),
        "List Unique Values": tpl.listUnique(", "),
        "Sum": tpl.sum(usFmt),
        "Integer Sum": tpl.sum(usFmtInt),
        "Average": tpl.average(usFmt),
        "Median": tpl.median(usFmt),
        "Sample Variance": tpl["var"](1, usFmt),
        "Sample Standard Deviation": tpl.stdev(1, usFmt),
        "Minimum": tpl.min(usFmt),
        "Maximum": tpl.max(usFmt),
        "First": tpl.first(usFmt),
        "Last": tpl.last(usFmt),
        "Sum over Sum": tpl.sumOverSum(usFmt),
        "80% Upper Bound": tpl.sumOverSumBound80(true, usFmt),
        "80% Lower Bound": tpl.sumOverSumBound80(false, usFmt),
        "Sum as Fraction of Total": tpl.fractionOf(tpl.sum(), "total", usFmtPct),
        "Sum as Fraction of Rows": tpl.fractionOf(tpl.sum(), "row", usFmtPct),
        "Sum as Fraction of Columns": tpl.fractionOf(tpl.sum(), "col", usFmtPct),
        "Count as Fraction of Total": tpl.fractionOf(tpl.count(), "total", usFmtPct),
        "Count as Fraction of Rows": tpl.fractionOf(tpl.count(), "row", usFmtPct),
        "Count as Fraction of Columns": tpl.fractionOf(tpl.count(), "col", usFmtPct)
      };
    })(aggregatorTemplates);
    renderers = {
      "Table": function(data, opts) {
        return pivotTableRenderer(data, opts);
      },
      "Table Barchart": function(data, opts) {
        return $(pivotTableRenderer(data, opts)).barchart();
      },
      "Heatmap": function(data, opts) {
        return $(pivotTableRenderer(data, opts)).heatmap("heatmap", opts);
      },
      "Row Heatmap": function(data, opts) {
        return $(pivotTableRenderer(data, opts)).heatmap("rowheatmap", opts);
      },
      "Col Heatmap": function(data, opts) {
        return $(pivotTableRenderer(data, opts)).heatmap("colheatmap", opts);
      }
    };
    locales = {
      en: {
        aggregators: aggregators,
        renderers: renderers,
        localeStrings: {
          renderError: "An error occurred rendering the PivotTable results.",
          computeError: "An error occurred computing the PivotTable results.",
          uiRenderError: "An error occurred rendering the PivotTable UI.",
          selectAll: "Select All",
          selectNone: "Select None",
          tooMany: "(too many to list)",
          filterResults: "Filter values",
          apply: "Apply",
          cancel: "Cancel",
          totals: "Totals",
          vs: "vs",
          by: "by"
        }
      }
    };
    mthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    zeroPad = function(number) {
      return ("0" + number).substr(-2, 2);
    };
    derivers = {
      bin: function(col, binWidth) {
        return function(record) {
          return record[col] - record[col] % binWidth;
        };
      },
      dateFormat: function(col, formatString, utcOutput, mthNames, dayNames) {
        var utc;
        if (utcOutput == null) {
          utcOutput = false;
        }
        if (mthNames == null) {
          mthNames = mthNamesEn;
        }
        if (dayNames == null) {
          dayNames = dayNamesEn;
        }
        utc = utcOutput ? "UTC" : "";
        return function(record) {
          var date;
          date = new Date(Date.parse(record[col]));
          if (isNaN(date)) {
            return "";
          }
          return formatString.replace(/%(.)/g, function(m, p) {
            switch (p) {
              case "y":
                return date["get" + utc + "FullYear"]();
              case "m":
                return zeroPad(date["get" + utc + "Month"]() + 1);
              case "n":
                return mthNames[date["get" + utc + "Month"]()];
              case "d":
                return zeroPad(date["get" + utc + "Date"]());
              case "w":
                return dayNames[date["get" + utc + "Day"]()];
              case "x":
                return date["get" + utc + "Day"]();
              case "H":
                return zeroPad(date["get" + utc + "Hours"]());
              case "M":
                return zeroPad(date["get" + utc + "Minutes"]());
              case "S":
                return zeroPad(date["get" + utc + "Seconds"]());
              default:
                return "%" + p;
            }
          });
        };
      }
    };
    rx = /(\d+)|(\D+)/g;
    rd = /\d/;
    rz = /^0/;
    naturalSort = (function(_this) {
      return function(as, bs) {
        var a, a1, b, b1, nas, nbs;
        if ((bs != null) && (as == null)) {
          return -1;
        }
        if ((as != null) && (bs == null)) {
          return 1;
        }
        if (typeof as === "number" && isNaN(as)) {
          return -1;
        }
        if (typeof bs === "number" && isNaN(bs)) {
          return 1;
        }
        nas = +as;
        nbs = +bs;
        if (nas < nbs) {
          return -1;
        }
        if (nas > nbs) {
          return 1;
        }
        if (typeof as === "number" && typeof bs !== "number") {
          return -1;
        }
        if (typeof bs === "number" && typeof as !== "number") {
          return 1;
        }
        if (typeof as === "number" && typeof bs === "number") {
          return 0;
        }
        if (isNaN(nbs) && !isNaN(nas)) {
          return -1;
        }
        if (isNaN(nas) && !isNaN(nbs)) {
          return 1;
        }
        a = String(as);
        b = String(bs);
        if (a === b) {
          return 0;
        }
        if (!(rd.test(a) && rd.test(b))) {
          return (a > b ? 1 : -1);
        }
        a = a.match(rx);
        b = b.match(rx);
        while (a.length && b.length) {
          a1 = a.shift();
          b1 = b.shift();
          if (a1 !== b1) {
            if (rd.test(a1) && rd.test(b1)) {
              return a1.replace(rz, ".0") - b1.replace(rz, ".0");
            } else {
              return (a1 > b1 ? 1 : -1);
            }
          }
        }
        return a.length - b.length;
      };
    })(this);
    sortAs = function(order) {
      var i, l_mapping, mapping, x;
      mapping = {};
      l_mapping = {};
      for (i in order) {
        x = order[i];
        mapping[x] = i;
        if (typeof x === "string") {
          l_mapping[x.toLowerCase()] = i;
        }
      }
      return function(a, b) {
        if ((mapping[a] != null) && (mapping[b] != null)) {
          return mapping[a] - mapping[b];
        } else if (mapping[a] != null) {
          return -1;
        } else if (mapping[b] != null) {
          return 1;
        } else if ((l_mapping[a] != null) && (l_mapping[b] != null)) {
          return l_mapping[a] - l_mapping[b];
        } else if (l_mapping[a] != null) {
          return -1;
        } else if (l_mapping[b] != null) {
          return 1;
        } else {
          return naturalSort(a, b);
        }
      };
    };
    getSort = function(sorters, attr) {
      var sort;
      if (sorters != null) {
        if ($.isFunction(sorters)) {
          sort = sorters(attr);
          if ($.isFunction(sort)) {
            return sort;
          }
        } else if (sorters[attr] != null) {
          return sorters[attr];
        }
      }
      return naturalSort;
    };

    /*
    Data Model class
     */
    PivotData = (function() {
      function PivotData(input, opts) {
        var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
        if (opts == null) {
          opts = {};
        }
        this.getAggregator = bind(this.getAggregator, this);
        this.getRowKeys = bind(this.getRowKeys, this);
        this.getColKeys = bind(this.getColKeys, this);
        this.sortKeys = bind(this.sortKeys, this);
        this.arrSort = bind(this.arrSort, this);
        this.input = input;
        this.aggregator = (ref = opts.aggregator) != null ? ref : aggregatorTemplates.count()();
        this.aggregatorName = (ref1 = opts.aggregatorName) != null ? ref1 : "Count";
        this.colAttrs = (ref2 = opts.cols) != null ? ref2 : [];
        this.rowAttrs = (ref3 = opts.rows) != null ? ref3 : [];
        this.valAttrs = (ref4 = opts.vals) != null ? ref4 : [];
        this.sorters = (ref5 = opts.sorters) != null ? ref5 : {};
        this.rowOrder = (ref6 = opts.rowOrder) != null ? ref6 : "key_a_to_z";
        this.colOrder = (ref7 = opts.colOrder) != null ? ref7 : "key_a_to_z";
        this.derivedAttributes = (ref8 = opts.derivedAttributes) != null ? ref8 : {};
        this.filter = (ref9 = opts.filter) != null ? ref9 : (function() {
          return true;
        });
        this.tree = {};
        this.rowKeys = [];
        this.colKeys = [];
        this.rowTotals = {};
        this.colTotals = {};
        this.allTotal = this.aggregator(this, [], []);
        this.sorted = false;
        PivotData.forEachRecord(this.input, this.derivedAttributes, (function(_this) {
          return function(record) {
            if (_this.filter(record)) {
              return _this.processRecord(record);
            }
          };
        })(this));
      }

      PivotData.forEachRecord = function(input, derivedAttributes, f) {
        var addRecord, compactRecord, i, j, k, l, len1, record, ref, results, results1, tblCols;
        if ($.isEmptyObject(derivedAttributes)) {
          addRecord = f;
        } else {
          addRecord = function(record) {
            var k, ref, v;
            for (k in derivedAttributes) {
              v = derivedAttributes[k];
              record[k] = (ref = v(record)) != null ? ref : record[k];
            }
            return f(record);
          };
        }
        if ($.isFunction(input)) {
          return input(addRecord);
        } else if ($.isArray(input)) {
          if ($.isArray(input[0])) {
            results = [];
            for (i in input) {
              if (!hasProp.call(input, i)) continue;
              compactRecord = input[i];
              if (!(i > 0)) {
                continue;
              }
              record = {};
              ref = input[0];
              for (j in ref) {
                if (!hasProp.call(ref, j)) continue;
                k = ref[j];
                record[k] = compactRecord[j];
              }
              results.push(addRecord(record));
            }
            return results;
          } else {
            results1 = [];
            for (l = 0, len1 = input.length; l < len1; l++) {
              record = input[l];
              results1.push(addRecord(record));
            }
            return results1;
          }
        } else if (input instanceof $) {
          tblCols = [];
          $("thead > tr > th", input).each(function(i) {
            return tblCols.push($(this).text());
          });
          return $("tbody > tr", input).each(function(i) {
            record = {};
            $("td", this).each(function(j) {
              return record[tblCols[j]] = $(this).text();
            });
            return addRecord(record);
          });
        } else {
          throw new Error("unknown input format");
        }
      };

      PivotData.prototype.forEachMatchingRecord = function(criteria, callback) {
        return PivotData.forEachRecord(this.input, this.derivedAttributes, (function(_this) {
          return function(record) {
            var k, ref, v;
            if (!_this.filter(record)) {
              return;
            }
            for (k in criteria) {
              v = criteria[k];
              if (v !== ((ref = record[k]) != null ? ref : "null")) {
                return;
              }
            }
            return callback(record);
          };
        })(this));
      };

      PivotData.prototype.arrSort = function(attrs) {
        var a, sortersArr;
        sortersArr = (function() {
          var l, len1, results;
          results = [];
          for (l = 0, len1 = attrs.length; l < len1; l++) {
            a = attrs[l];
            results.push(getSort(this.sorters, a));
          }
          return results;
        }).call(this);
        return function(a, b) {
          var comparison, i, sorter;
          for (i in sortersArr) {
            if (!hasProp.call(sortersArr, i)) continue;
            sorter = sortersArr[i];
            comparison = sorter(a[i], b[i]);
            if (comparison !== 0) {
              return comparison;
            }
          }
          return 0;
        };
      };

      PivotData.prototype.sortKeys = function() {
        var v;
        if (!this.sorted) {
          this.sorted = true;
          v = (function(_this) {
            return function(r, c) {
              return _this.getAggregator(r, c).value();
            };
          })(this);
          switch (this.rowOrder) {
            case "value_a_to_z":
              this.rowKeys.sort((function(_this) {
                return function(a, b) {
                  return naturalSort(v(a, []), v(b, []));
                };
              })(this));
              break;
            case "value_z_to_a":
              this.rowKeys.sort((function(_this) {
                return function(a, b) {
                  return -naturalSort(v(a, []), v(b, []));
                };
              })(this));
              break;
            default:
              this.rowKeys.sort(this.arrSort(this.rowAttrs));
          }
          switch (this.colOrder) {
            case "value_a_to_z":
              return this.colKeys.sort((function(_this) {
                return function(a, b) {
                  return naturalSort(v([], a), v([], b));
                };
              })(this));
            case "value_z_to_a":
              return this.colKeys.sort((function(_this) {
                return function(a, b) {
                  return -naturalSort(v([], a), v([], b));
                };
              })(this));
            default:
              return this.colKeys.sort(this.arrSort(this.colAttrs));
          }
        }
      };

      PivotData.prototype.getColKeys = function() {
        this.sortKeys();
        return this.colKeys;
      };

      PivotData.prototype.getRowKeys = function() {
        this.sortKeys();
        return this.rowKeys;
      };

      PivotData.prototype.processRecord = function(record) {
        var colKey, flatColKey, flatRowKey, l, len1, len2, n, ref, ref1, ref2, ref3, rowKey, x;
        colKey = [];
        rowKey = [];
        ref = this.colAttrs;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          x = ref[l];
          colKey.push((ref1 = record[x]) != null ? ref1 : "null");
        }
        ref2 = this.rowAttrs;
        for (n = 0, len2 = ref2.length; n < len2; n++) {
          x = ref2[n];
          rowKey.push((ref3 = record[x]) != null ? ref3 : "null");
        }
        flatRowKey = rowKey.join(String.fromCharCode(0));
        flatColKey = colKey.join(String.fromCharCode(0));
        this.allTotal.push(record);
        if (rowKey.length !== 0) {
          if (!this.rowTotals[flatRowKey]) {
            this.rowKeys.push(rowKey);
            this.rowTotals[flatRowKey] = this.aggregator(this, rowKey, []);
          }
          this.rowTotals[flatRowKey].push(record);
        }
        if (colKey.length !== 0) {
          if (!this.colTotals[flatColKey]) {
            this.colKeys.push(colKey);
            this.colTotals[flatColKey] = this.aggregator(this, [], colKey);
          }
          this.colTotals[flatColKey].push(record);
        }
        if (colKey.length !== 0 && rowKey.length !== 0) {
          if (!this.tree[flatRowKey]) {
            this.tree[flatRowKey] = {};
          }
          if (!this.tree[flatRowKey][flatColKey]) {
            this.tree[flatRowKey][flatColKey] = this.aggregator(this, rowKey, colKey);
          }
          return this.tree[flatRowKey][flatColKey].push(record);
        }
      };

      PivotData.prototype.getAggregator = function(rowKey, colKey) {
        var agg, flatColKey, flatRowKey;
        flatRowKey = rowKey.join(String.fromCharCode(0));
        flatColKey = colKey.join(String.fromCharCode(0));
        if (rowKey.length === 0 && colKey.length === 0) {
          agg = this.allTotal;
        } else if (rowKey.length === 0) {
          agg = this.colTotals[flatColKey];
        } else if (colKey.length === 0) {
          agg = this.rowTotals[flatRowKey];
        } else {
          agg = this.tree[flatRowKey][flatColKey];
        }
        return agg != null ? agg : {
          value: (function() {
            return null;
          }),
          format: function() {
            return "";
          }
        };
      };

      return PivotData;

    })();
    $.pivotUtilities = {
      aggregatorTemplates: aggregatorTemplates,
      aggregators: aggregators,
      renderers: renderers,
      derivers: derivers,
      locales: locales,
      naturalSort: naturalSort,
      numberFormat: numberFormat,
      sortAs: sortAs,
      PivotData: PivotData
    };

    /*
    Default Renderer for hierarchical table layout
     */
    pivotTableRenderer = function(pivotData, opts) {
      var aggregator, c, colAttrs, colKey, colKeys, defaults, getClickHandler, i, j, r, result, rowAttrs, rowKey, rowKeys, spanSize, tbody, td, th, thead, totalAggregator, tr, txt, val, x;
      defaults = {
        table: {
          clickCallback: null
        },
        localeStrings: {
          totals: "Totals"
        }
      };
      opts = $.extend(true, {}, defaults, opts);
      colAttrs = pivotData.colAttrs;
      rowAttrs = pivotData.rowAttrs;
      rowKeys = pivotData.getRowKeys();
      colKeys = pivotData.getColKeys();
      if (opts.table.clickCallback) {
        getClickHandler = function(value, rowValues, colValues) {
          var attr, filters, i;
          filters = {};
          for (i in colAttrs) {
            if (!hasProp.call(colAttrs, i)) continue;
            attr = colAttrs[i];
            if (colValues[i] != null) {
              filters[attr] = colValues[i];
            }
          }
          for (i in rowAttrs) {
            if (!hasProp.call(rowAttrs, i)) continue;
            attr = rowAttrs[i];
            if (rowValues[i] != null) {
              filters[attr] = rowValues[i];
            }
          }
          return function(e) {
            return opts.table.clickCallback(e, value, filters, pivotData);
          };
        };
      }
      result = document.createElement("table");
      result.className = "pvtTable";
      spanSize = function(arr, i, j) {
        var l, len, n, noDraw, ref, ref1, stop, x;
        if (i !== 0) {
          noDraw = true;
          for (x = l = 0, ref = j; 0 <= ref ? l <= ref : l >= ref; x = 0 <= ref ? ++l : --l) {
            if (arr[i - 1][x] !== arr[i][x]) {
              noDraw = false;
            }
          }
          if (noDraw) {
            return -1;
          }
        }
        len = 0;
        while (i + len < arr.length) {
          stop = false;
          for (x = n = 0, ref1 = j; 0 <= ref1 ? n <= ref1 : n >= ref1; x = 0 <= ref1 ? ++n : --n) {
            if (arr[i][x] !== arr[i + len][x]) {
              stop = true;
            }
          }
          if (stop) {
            break;
          }
          len++;
        }
        return len;
      };
      thead = document.createElement("thead");
      for (j in colAttrs) {
        if (!hasProp.call(colAttrs, j)) continue;
        c = colAttrs[j];
        tr = document.createElement("tr");
        if (parseInt(j) === 0 && rowAttrs.length !== 0) {
          th = document.createElement("th");
          th.setAttribute("colspan", rowAttrs.length);
          th.setAttribute("rowspan", colAttrs.length);
          tr.appendChild(th);
        }
        th = document.createElement("th");
        th.className = "pvtAxisLabel";
        th.textContent = c;
        tr.appendChild(th);
        for (i in colKeys) {
          if (!hasProp.call(colKeys, i)) continue;
          colKey = colKeys[i];
          x = spanSize(colKeys, parseInt(i), parseInt(j));
          if (x !== -1) {
            th = document.createElement("th");
            th.className = "pvtColLabel";
            th.textContent = colKey[j];
            th.setAttribute("colspan", x);
            if (parseInt(j) === colAttrs.length - 1 && rowAttrs.length !== 0) {
              th.setAttribute("rowspan", 2);
            }
            tr.appendChild(th);
          }
        }
        if (parseInt(j) === 0) {
          th = document.createElement("th");
          th.className = "pvtTotalLabel pvtRowTotalLabel";
          th.innerHTML = opts.localeStrings.totals;
          th.setAttribute("rowspan", colAttrs.length + (rowAttrs.length === 0 ? 0 : 1));
          tr.appendChild(th);
        }
        thead.appendChild(tr);
      }
      if (rowAttrs.length !== 0) {
        tr = document.createElement("tr");
        for (i in rowAttrs) {
          if (!hasProp.call(rowAttrs, i)) continue;
          r = rowAttrs[i];
          th = document.createElement("th");
          th.className = "pvtAxisLabel";
          th.textContent = r;
          tr.appendChild(th);
        }
        th = document.createElement("th");
        if (colAttrs.length === 0) {
          th.className = "pvtTotalLabel pvtRowTotalLabel";
          th.innerHTML = opts.localeStrings.totals;
        }
        tr.appendChild(th);
        thead.appendChild(tr);
      }
      result.appendChild(thead);
      tbody = document.createElement("tbody");
      for (i in rowKeys) {
        if (!hasProp.call(rowKeys, i)) continue;
        rowKey = rowKeys[i];
        tr = document.createElement("tr");
        for (j in rowKey) {
          if (!hasProp.call(rowKey, j)) continue;
          txt = rowKey[j];
          x = spanSize(rowKeys, parseInt(i), parseInt(j));
          if (x !== -1) {
            th = document.createElement("th");
            th.className = "pvtRowLabel";
            th.textContent = txt;
            th.setAttribute("rowspan", x);
            if (parseInt(j) === rowAttrs.length - 1 && colAttrs.length !== 0) {
              th.setAttribute("colspan", 2);
            }
            tr.appendChild(th);
          }
        }
        for (j in colKeys) {
          if (!hasProp.call(colKeys, j)) continue;
          colKey = colKeys[j];
          aggregator = pivotData.getAggregator(rowKey, colKey);
          val = aggregator.value();
          td = document.createElement("td");
          td.className = "pvtVal row" + i + " col" + j;
          td.textContent = aggregator.format(val);
          td.setAttribute("data-value", val);
          if (getClickHandler != null) {
            td.onclick = getClickHandler(val, rowKey, colKey);
          }
          tr.appendChild(td);
        }
        totalAggregator = pivotData.getAggregator(rowKey, []);
        val = totalAggregator.value();
        td = document.createElement("td");
        td.className = "pvtTotal rowTotal";
        td.textContent = totalAggregator.format(val);
        td.setAttribute("data-value", val);
        if (getClickHandler != null) {
          td.onclick = getClickHandler(val, rowKey, []);
        }
        td.setAttribute("data-for", "row" + i);
        tr.appendChild(td);
        tbody.appendChild(tr);
      }
      tr = document.createElement("tr");
      th = document.createElement("th");
      th.className = "pvtTotalLabel pvtColTotalLabel";
      th.innerHTML = opts.localeStrings.totals;
      th.setAttribute("colspan", rowAttrs.length + (colAttrs.length === 0 ? 0 : 1));
      tr.appendChild(th);
      for (j in colKeys) {
        if (!hasProp.call(colKeys, j)) continue;
        colKey = colKeys[j];
        totalAggregator = pivotData.getAggregator([], colKey);
        val = totalAggregator.value();
        td = document.createElement("td");
        td.className = "pvtTotal colTotal";
        td.textContent = totalAggregator.format(val);
        td.setAttribute("data-value", val);
        if (getClickHandler != null) {
          td.onclick = getClickHandler(val, [], colKey);
        }
        td.setAttribute("data-for", "col" + j);
        tr.appendChild(td);
      }
      totalAggregator = pivotData.getAggregator([], []);
      val = totalAggregator.value();
      td = document.createElement("td");
      td.className = "pvtGrandTotal";
      td.textContent = totalAggregator.format(val);
      td.setAttribute("data-value", val);
      if (getClickHandler != null) {
        td.onclick = getClickHandler(val, [], []);
      }
      tr.appendChild(td);
      tbody.appendChild(tr);
      result.appendChild(tbody);
      result.setAttribute("data-numrows", rowKeys.length);
      result.setAttribute("data-numcols", colKeys.length);
      return result;
    };

    /*
    Pivot Table core: create PivotData object and call Renderer on it
     */
    $.fn.pivot = function(input, inputOpts, locale) {
      var defaults, e, localeDefaults, localeStrings, opts, pivotData, result, x;
      if (locale == null) {
        locale = "en";
      }
      if (locales[locale] == null) {
        locale = "en";
      }
      defaults = {
        cols: [],
        rows: [],
        vals: [],
        rowOrder: "key_a_to_z",
        colOrder: "key_a_to_z",
        dataClass: PivotData,
        filter: function() {
          return true;
        },
        aggregator: aggregatorTemplates.count()(),
        aggregatorName: "Count",
        sorters: {},
        derivedAttributes: {},
        renderer: pivotTableRenderer
      };
      localeStrings = $.extend(true, {}, locales.en.localeStrings, locales[locale].localeStrings);
      localeDefaults = {
        rendererOptions: {
          localeStrings: localeStrings
        },
        localeStrings: localeStrings
      };
      opts = $.extend(true, {}, localeDefaults, $.extend({}, defaults, inputOpts));
      result = null;
      try {
        pivotData = new opts.dataClass(input, opts);
        try {
          result = opts.renderer(pivotData, opts.rendererOptions);
        } catch (error) {
          e = error;
          if (typeof console !== "undefined" && console !== null) {
            console.error(e.stack);
          }
          result = $("<span>").html(opts.localeStrings.renderError);
        }
      } catch (error) {
        e = error;
        if (typeof console !== "undefined" && console !== null) {
          console.error(e.stack);
        }
        result = $("<span>").html(opts.localeStrings.computeError);
      }
      x = this[0];
      while (x.hasChildNodes()) {
        x.removeChild(x.lastChild);
      }
      return this.append(result);
    };

    /*
    Pivot Table UI: calls Pivot Table core above with options set by user
     */
    $.fn.pivotUI = function(input, inputOpts, overwrite, locale) {
      var a, aggregator, attr, attrLength, attrValues, c, colOrderArrow, defaults, e, existingOpts, fn1, i, initialRender, l, len1, len2, len3, localeDefaults, localeStrings, materializedInput, n, o, opts, ordering, pivotTable, recordsProcessed, ref, ref1, ref2, ref3, refresh, refreshDelayed, renderer, rendererControl, rowOrderArrow, shownAttributes, shownInAggregators, shownInDragDrop, tr1, tr2, uiTable, unused, unusedAttrsVerticalAutoCutoff, unusedAttrsVerticalAutoOverride, x;
      if (overwrite == null) {
        overwrite = false;
      }
      if (locale == null) {
        locale = "en";
      }
      if (locales[locale] == null) {
        locale = "en";
      }
      defaults = {
        derivedAttributes: {},
        aggregators: locales[locale].aggregators,
        renderers: locales[locale].renderers,
        hiddenAttributes: [],
        hiddenFromAggregators: [],
        hiddenFromDragDrop: [],
        menuLimit: 500,
        cols: [],
        rows: [],
        vals: [],
        rowOrder: "key_a_to_z",
        colOrder: "key_a_to_z",
        dataClass: PivotData,
        exclusions: {},
        inclusions: {},
        unusedAttrsVertical: 85,
        autoSortUnusedAttrs: false,
        onRefresh: null,
        filter: function() {
          return true;
        },
        sorters: {}
      };
      localeStrings = $.extend(true, {}, locales.en.localeStrings, locales[locale].localeStrings);
      localeDefaults = {
        rendererOptions: {
          localeStrings: localeStrings
        },
        localeStrings: localeStrings
      };
      existingOpts = this.data("pivotUIOptions");
      if ((existingOpts == null) || overwrite) {
        opts = $.extend(true, {}, localeDefaults, $.extend({}, defaults, inputOpts));
      } else {
        opts = existingOpts;
      }
      try {
        attrValues = {};
        materializedInput = [];
        recordsProcessed = 0;
        PivotData.forEachRecord(input, opts.derivedAttributes, function(record) {
          var attr, base, ref, value;
          if (!opts.filter(record)) {
            return;
          }
          materializedInput.push(record);
          for (attr in record) {
            if (!hasProp.call(record, attr)) continue;
            if (attrValues[attr] == null) {
              attrValues[attr] = {};
              if (recordsProcessed > 0) {
                attrValues[attr]["null"] = recordsProcessed;
              }
            }
          }
          for (attr in attrValues) {
            value = (ref = record[attr]) != null ? ref : "null";
            if ((base = attrValues[attr])[value] == null) {
              base[value] = 0;
            }
            attrValues[attr][value]++;
          }
          return recordsProcessed++;
        });
        uiTable = $("<table>", {
          "class": "pvtUi"
        }).attr("cellpadding", 5);
        rendererControl = $("<td>");
        renderer = $("<select>").addClass('pvtRenderer').appendTo(rendererControl).bind("change", function() {
          return refresh();
        });
        ref = opts.renderers;
        for (x in ref) {
          if (!hasProp.call(ref, x)) continue;
          $("<option>").val(x).html(x).appendTo(renderer);
        }
        unused = $("<td>").addClass('pvtAxisContainer pvtUnused');
        shownAttributes = (function() {
          var results;
          results = [];
          for (a in attrValues) {
            if (indexOf.call(opts.hiddenAttributes, a) < 0) {
              results.push(a);
            }
          }
          return results;
        })();
        shownInAggregators = (function() {
          var l, len1, results;
          results = [];
          for (l = 0, len1 = shownAttributes.length; l < len1; l++) {
            c = shownAttributes[l];
            if (indexOf.call(opts.hiddenFromAggregators, c) < 0) {
              results.push(c);
            }
          }
          return results;
        })();
        shownInDragDrop = (function() {
          var l, len1, results;
          results = [];
          for (l = 0, len1 = shownAttributes.length; l < len1; l++) {
            c = shownAttributes[l];
            if (indexOf.call(opts.hiddenFromDragDrop, c) < 0) {
              results.push(c);
            }
          }
          return results;
        })();
        unusedAttrsVerticalAutoOverride = false;
        if (opts.unusedAttrsVertical === "auto") {
          unusedAttrsVerticalAutoCutoff = 120;
        } else {
          unusedAttrsVerticalAutoCutoff = parseInt(opts.unusedAttrsVertical);
        }
        if (!isNaN(unusedAttrsVerticalAutoCutoff)) {
          attrLength = 0;
          for (l = 0, len1 = shownInDragDrop.length; l < len1; l++) {
            a = shownInDragDrop[l];
            attrLength += a.length;
          }
          unusedAttrsVerticalAutoOverride = attrLength > unusedAttrsVerticalAutoCutoff;
        }
        if (opts.unusedAttrsVertical === true || unusedAttrsVerticalAutoOverride) {
          unused.addClass('pvtVertList');
        } else {
          unused.addClass('pvtHorizList');
        }
        fn1 = function(attr) {
          var attrElem, checkContainer, closeFilterBox, controls, filterItem, filterItemExcluded, finalButtons, hasExcludedItem, len2, n, placeholder, ref1, sorter, triangleLink, v, value, valueCount, valueList, values;
          values = (function() {
            var results;
            results = [];
            for (v in attrValues[attr]) {
              results.push(v);
            }
            return results;
          })();
          hasExcludedItem = false;
          valueList = $("<div>").addClass('pvtFilterBox').hide();
          valueList.append($("<h4>").append($("<span>").text(attr), $("<span>").addClass("count").text("(" + values.length + ")")));
          if (values.length > opts.menuLimit) {
            valueList.append($("<p>").html(opts.localeStrings.tooMany));
          } else {
            if (values.length > 5) {
              controls = $("<p>").appendTo(valueList);
              sorter = getSort(opts.sorters, attr);
              placeholder = opts.localeStrings.filterResults;
              $("<input>", {
                type: "text"
              }).appendTo(controls).attr({
                placeholder: placeholder,
                "class": "pvtSearch"
              }).bind("keyup", function() {
                var accept, accept_gen, filter;
                filter = $(this).val().toLowerCase().trim();
                accept_gen = function(prefix, accepted) {
                  return function(v) {
                    var real_filter, ref1;
                    real_filter = filter.substring(prefix.length).trim();
                    if (real_filter.length === 0) {
                      return true;
                    }
                    return ref1 = Math.sign(sorter(v.toLowerCase(), real_filter)), indexOf.call(accepted, ref1) >= 0;
                  };
                };
                accept = filter.indexOf(">=") === 0 ? accept_gen(">=", [1, 0]) : filter.indexOf("<=") === 0 ? accept_gen("<=", [-1, 0]) : filter.indexOf(">") === 0 ? accept_gen(">", [1]) : filter.indexOf("<") === 0 ? accept_gen("<", [-1]) : filter.indexOf("~") === 0 ? function(v) {
                  if (filter.substring(1).trim().length === 0) {
                    return true;
                  }
                  return v.toLowerCase().match(filter.substring(1));
                } : function(v) {
                  return v.toLowerCase().indexOf(filter) !== -1;
                };
                return valueList.find('.pvtCheckContainer p label span.value').each(function() {
                  if (accept($(this).text())) {
                    return $(this).parent().parent().show();
                  } else {
                    return $(this).parent().parent().hide();
                  }
                });
              });
              controls.append($("<br>"));
              $("<button>", {
                type: "button"
              }).appendTo(controls).html(opts.localeStrings.selectAll).bind("click", function() {
                valueList.find("input:visible:not(:checked)").prop("checked", true).toggleClass("changed");
                return false;
              });
              $("<button>", {
                type: "button"
              }).appendTo(controls).html(opts.localeStrings.selectNone).bind("click", function() {
                valueList.find("input:visible:checked").prop("checked", false).toggleClass("changed");
                return false;
              });
            }
            checkContainer = $("<div>").addClass("pvtCheckContainer").appendTo(valueList);
            ref1 = values.sort(getSort(opts.sorters, attr));
            for (n = 0, len2 = ref1.length; n < len2; n++) {
              value = ref1[n];
              valueCount = attrValues[attr][value];
              filterItem = $("<label>");
              filterItemExcluded = false;
              if (opts.inclusions[attr]) {
                filterItemExcluded = (indexOf.call(opts.inclusions[attr], value) < 0);
              } else if (opts.exclusions[attr]) {
                filterItemExcluded = (indexOf.call(opts.exclusions[attr], value) >= 0);
              }
              hasExcludedItem || (hasExcludedItem = filterItemExcluded);
              $("<input>").attr("type", "checkbox").addClass('pvtFilter').attr("checked", !filterItemExcluded).data("filter", [attr, value]).appendTo(filterItem).bind("change", function() {
                return $(this).toggleClass("changed");
              });
              filterItem.append($("<span>").addClass("value").text(value));
              filterItem.append($("<span>").addClass("count").text("(" + valueCount + ")"));
              checkContainer.append($("<p>").append(filterItem));
            }
          }
          closeFilterBox = function() {
            if (valueList.find("[type='checkbox']").length > valueList.find("[type='checkbox']:checked").length) {
              attrElem.addClass("pvtFilteredAttribute");
            } else {
              attrElem.removeClass("pvtFilteredAttribute");
            }
            valueList.find('.pvtSearch').val('');
            valueList.find('.pvtCheckContainer p').show();
            return valueList.hide();
          };
          finalButtons = $("<p>").appendTo(valueList);
          if (values.length <= opts.menuLimit) {
            $("<button>", {
              type: "button"
            }).text(opts.localeStrings.apply).appendTo(finalButtons).bind("click", function() {
              if (valueList.find(".changed").removeClass("changed").length) {
                refresh();
              }
              return closeFilterBox();
            });
          }
          $("<button>", {
            type: "button"
          }).text(opts.localeStrings.cancel).appendTo(finalButtons).bind("click", function() {
            valueList.find(".changed:checked").removeClass("changed").prop("checked", false);
            valueList.find(".changed:not(:checked)").removeClass("changed").prop("checked", true);
            return closeFilterBox();
          });
          triangleLink = $("<span>").addClass('pvtTriangle').html(" &#x25BE;").bind("click", function(e) {
            var left, ref2, top;
            ref2 = $(e.currentTarget).position(), left = ref2.left, top = ref2.top;
            return valueList.css({
              left: left + 10,
              top: top + 10
            }).show();
          });
          attrElem = $("<li>").addClass("axis_" + i).append($("<span>").addClass('pvtAttr').text(attr).data("attrName", attr).append(triangleLink));
          if (hasExcludedItem) {
            attrElem.addClass('pvtFilteredAttribute');
          }
          return unused.append(attrElem).append(valueList);
        };
        for (i in shownInDragDrop) {
          if (!hasProp.call(shownInDragDrop, i)) continue;
          attr = shownInDragDrop[i];
          fn1(attr);
        }
        tr1 = $("<tr>").appendTo(uiTable);
        aggregator = $("<select>").addClass('pvtAggregator').bind("change", function() {
          return refresh();
        });
        ref1 = opts.aggregators;
        for (x in ref1) {
          if (!hasProp.call(ref1, x)) continue;
          aggregator.append($("<option>").val(x).html(x));
        }
        ordering = {
          key_a_to_z: {
            rowSymbol: "&varr;",
            colSymbol: "&harr;",
            next: "value_a_to_z"
          },
          value_a_to_z: {
            rowSymbol: "&darr;",
            colSymbol: "&rarr;",
            next: "value_z_to_a"
          },
          value_z_to_a: {
            rowSymbol: "&uarr;",
            colSymbol: "&larr;",
            next: "key_a_to_z"
          }
        };
        rowOrderArrow = $("<a>", {
          role: "button"
        }).addClass("pvtRowOrder").data("order", opts.rowOrder).html(ordering[opts.rowOrder].rowSymbol).bind("click", function() {
          $(this).data("order", ordering[$(this).data("order")].next);
          $(this).html(ordering[$(this).data("order")].rowSymbol);
          return refresh();
        });
        colOrderArrow = $("<a>", {
          role: "button"
        }).addClass("pvtColOrder").data("order", opts.colOrder).html(ordering[opts.colOrder].colSymbol).bind("click", function() {
          $(this).data("order", ordering[$(this).data("order")].next);
          $(this).html(ordering[$(this).data("order")].colSymbol);
          return refresh();
        });
        $("<td>").addClass('pvtVals').appendTo(tr1).append(aggregator).append(rowOrderArrow).append(colOrderArrow).append($("<br>"));
        $("<td>").addClass('pvtAxisContainer pvtHorizList pvtCols').appendTo(tr1);
        tr2 = $("<tr>").appendTo(uiTable);
        tr2.append($("<td>").addClass('pvtAxisContainer pvtRows').attr("valign", "top"));
        pivotTable = $("<td>").attr("valign", "top").addClass('pvtRendererArea').appendTo(tr2);
        if (opts.unusedAttrsVertical === true || unusedAttrsVerticalAutoOverride) {
          uiTable.find('tr:nth-child(1)').prepend(rendererControl);
          uiTable.find('tr:nth-child(2)').prepend(unused);
        } else {
          uiTable.prepend($("<tr>").append(rendererControl).append(unused));
        }
        this.html(uiTable);
        ref2 = opts.cols;
        for (n = 0, len2 = ref2.length; n < len2; n++) {
          x = ref2[n];
          this.find(".pvtCols").append(this.find(".axis_" + ($.inArray(x, shownInDragDrop))));
        }
        ref3 = opts.rows;
        for (o = 0, len3 = ref3.length; o < len3; o++) {
          x = ref3[o];
          this.find(".pvtRows").append(this.find(".axis_" + ($.inArray(x, shownInDragDrop))));
        }
        if (opts.aggregatorName != null) {
          this.find(".pvtAggregator").val(opts.aggregatorName);
        }
        if (opts.rendererName != null) {
          this.find(".pvtRenderer").val(opts.rendererName);
        }
        initialRender = true;
        refreshDelayed = (function(_this) {
          return function() {
            var exclusions, inclusions, len4, newDropdown, numInputsToProcess, pivotUIOptions, pvtVals, ref4, ref5, subopts, t, u, unusedAttrsContainer, vals;
            subopts = {
              derivedAttributes: opts.derivedAttributes,
              localeStrings: opts.localeStrings,
              rendererOptions: opts.rendererOptions,
              sorters: opts.sorters,
              cols: [],
              rows: [],
              dataClass: opts.dataClass
            };
            numInputsToProcess = (ref4 = opts.aggregators[aggregator.val()]([])().numInputs) != null ? ref4 : 0;
            vals = [];
            _this.find(".pvtRows li span.pvtAttr").each(function() {
              return subopts.rows.push($(this).data("attrName"));
            });
            _this.find(".pvtCols li span.pvtAttr").each(function() {
              return subopts.cols.push($(this).data("attrName"));
            });
            _this.find(".pvtVals select.pvtAttrDropdown").each(function() {
              if (numInputsToProcess === 0) {
                return $(this).remove();
              } else {
                numInputsToProcess--;
                if ($(this).val() !== "") {
                  return vals.push($(this).val());
                }
              }
            });
            if (numInputsToProcess !== 0) {
              pvtVals = _this.find(".pvtVals");
              for (x = t = 0, ref5 = numInputsToProcess; 0 <= ref5 ? t < ref5 : t > ref5; x = 0 <= ref5 ? ++t : --t) {
                newDropdown = $("<select>").addClass('pvtAttrDropdown').append($("<option>")).bind("change", function() {
                  return refresh();
                });
                for (u = 0, len4 = shownInAggregators.length; u < len4; u++) {
                  attr = shownInAggregators[u];
                  newDropdown.append($("<option>").val(attr).text(attr));
                }
                pvtVals.append(newDropdown);
              }
            }
            if (initialRender) {
              vals = opts.vals;
              i = 0;
              _this.find(".pvtVals select.pvtAttrDropdown").each(function() {
                $(this).val(vals[i]);
                return i++;
              });
              initialRender = false;
            }
            subopts.aggregatorName = aggregator.val();
            subopts.vals = vals;
            subopts.aggregator = opts.aggregators[aggregator.val()](vals);
            subopts.renderer = opts.renderers[renderer.val()];
            subopts.rowOrder = rowOrderArrow.data("order");
            subopts.colOrder = colOrderArrow.data("order");
            exclusions = {};
            _this.find('input.pvtFilter').not(':checked').each(function() {
              var filter;
              filter = $(this).data("filter");
              if (exclusions[filter[0]] != null) {
                return exclusions[filter[0]].push(filter[1]);
              } else {
                return exclusions[filter[0]] = [filter[1]];
              }
            });
            inclusions = {};
            _this.find('input.pvtFilter:checked').each(function() {
              var filter;
              filter = $(this).data("filter");
              if (exclusions[filter[0]] != null) {
                if (inclusions[filter[0]] != null) {
                  return inclusions[filter[0]].push(filter[1]);
                } else {
                  return inclusions[filter[0]] = [filter[1]];
                }
              }
            });
            subopts.filter = function(record) {
              var excludedItems, k, ref6, ref7;
              if (!opts.filter(record)) {
                return false;
              }
              for (k in exclusions) {
                excludedItems = exclusions[k];
                if (ref6 = "" + ((ref7 = record[k]) != null ? ref7 : 'null'), indexOf.call(excludedItems, ref6) >= 0) {
                  return false;
                }
              }
              return true;
            };
            pivotTable.pivot(materializedInput, subopts);
            pivotUIOptions = $.extend({}, opts, {
              cols: subopts.cols,
              rows: subopts.rows,
              colOrder: subopts.colOrder,
              rowOrder: subopts.rowOrder,
              vals: vals,
              exclusions: exclusions,
              inclusions: inclusions,
              inclusionsInfo: inclusions,
              aggregatorName: aggregator.val(),
              rendererName: renderer.val()
            });
            _this.data("pivotUIOptions", pivotUIOptions);
            if (opts.autoSortUnusedAttrs) {
              unusedAttrsContainer = _this.find("td.pvtUnused.pvtAxisContainer");
              $(unusedAttrsContainer).children("li").sort(function(a, b) {
                return naturalSort($(a).text(), $(b).text());
              }).appendTo(unusedAttrsContainer);
            }
            pivotTable.css("opacity", 1);
            if (opts.onRefresh != null) {
              return opts.onRefresh(pivotUIOptions);
            }
          };
        })(this);
        refresh = (function(_this) {
          return function() {
            pivotTable.css("opacity", 0.5);
            return setTimeout(refreshDelayed, 10);
          };
        })(this);
        refresh();
        this.find(".pvtAxisContainer").sortable({
          update: function(e, ui) {
            if (ui.sender == null) {
              return refresh();
            }
          },
          connectWith: this.find(".pvtAxisContainer"),
          items: 'li',
          placeholder: 'pvtPlaceholder'
        });
      } catch (error) {
        e = error;
        if (typeof console !== "undefined" && console !== null) {
          console.error(e.stack);
        }
        this.html(opts.localeStrings.uiRenderError);
      }
      return this;
    };

    /*
    Heatmap post-processing
     */
    $.fn.heatmap = function(scope, opts) {
      var colorScaleGenerator, heatmapper, i, j, l, n, numCols, numRows, ref, ref1, ref2;
      if (scope == null) {
        scope = "heatmap";
      }
      numRows = this.data("numrows");
      numCols = this.data("numcols");
      colorScaleGenerator = opts != null ? (ref = opts.heatmap) != null ? ref.colorScaleGenerator : void 0 : void 0;
      if (colorScaleGenerator == null) {
        colorScaleGenerator = function(values) {
          var max, min;
          min = Math.min.apply(Math, values);
          max = Math.max.apply(Math, values);
          return function(x) {
            var nonRed;
            nonRed = 255 - Math.round(255 * (x - min) / (max - min));
            return "rgb(255," + nonRed + "," + nonRed + ")";
          };
        };
      }
      heatmapper = (function(_this) {
        return function(scope) {
          var colorScale, forEachCell, values;
          forEachCell = function(f) {
            return _this.find(scope).each(function() {
              var x;
              x = $(this).data("value");
              if ((x != null) && isFinite(x)) {
                return f(x, $(this));
              }
            });
          };
          values = [];
          forEachCell(function(x) {
            return values.push(x);
          });
          colorScale = colorScaleGenerator(values);
          return forEachCell(function(x, elem) {
            return elem.css("background-color", colorScale(x));
          });
        };
      })(this);
      switch (scope) {
        case "heatmap":
          heatmapper(".pvtVal");
          break;
        case "rowheatmap":
          for (i = l = 0, ref1 = numRows; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
            heatmapper(".pvtVal.row" + i);
          }
          break;
        case "colheatmap":
          for (j = n = 0, ref2 = numCols; 0 <= ref2 ? n < ref2 : n > ref2; j = 0 <= ref2 ? ++n : --n) {
            heatmapper(".pvtVal.col" + j);
          }
      }
      heatmapper(".pvtTotal.rowTotal");
      heatmapper(".pvtTotal.colTotal");
      return this;
    };

    /*
    Barchart post-processing
     */
    return $.fn.barchart = function(opts) {
      var barcharter, i, l, numCols, numRows, ref;
      numRows = this.data("numrows");
      numCols = this.data("numcols");
      barcharter = (function(_this) {
        return function(scope) {
          var forEachCell, max, min, range, scaler, values;
          forEachCell = function(f) {
            return _this.find(scope).each(function() {
              var x;
              x = $(this).data("value");
              if ((x != null) && isFinite(x)) {
                return f(x, $(this));
              }
            });
          };
          values = [];
          forEachCell(function(x) {
            return values.push(x);
          });
          max = Math.max.apply(Math, values);
          if (max < 0) {
            max = 0;
          }
          range = max;
          min = Math.min.apply(Math, values);
          if (min < 0) {
            range = max - min;
          }
          scaler = function(x) {
            return 100 * x / (1.4 * range);
          };
          return forEachCell(function(x, elem) {
            var bBase, bgColor, text, wrapper;
            text = elem.text();
            wrapper = $("<div>").css({
              "position": "relative",
              "height": "55px"
            });
            bgColor = "gray";
            bBase = 0;
            if (min < 0) {
              bBase = scaler(-min);
            }
            if (x < 0) {
              bBase += scaler(x);
              bgColor = "darkred";
              x = -x;
            }
            wrapper.append($("<div>").css({
              "position": "absolute",
              "bottom": bBase + "%",
              "left": 0,
              "right": 0,
              "height": scaler(x) + "%",
              "background-color": bgColor
            }));
            wrapper.append($("<div>").text(text).css({
              "position": "relative",
              "padding-left": "5px",
              "padding-right": "5px"
            }));
            return elem.css({
              "padding": 0,
              "padding-top": "5px",
              "text-align": "center"
            }).html(wrapper);
          });
        };
      })(this);
      for (i = l = 0, ref = numRows; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        barcharter(".pvtVal.row" + i);
      }
      barcharter(".pvtTotal.colTotal");
      return this;
    };
  });

}).call(this);

//# sourceMappingURL=pivot.js.map

(function() {
  var callWithJQuery,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  callWithJQuery = function(pivotModule) {
    if (typeof exports === "object" && typeof module === "object") {
      return pivotModule(require("jquery"));
    } else if (typeof define === "function" && define.amd) {
      return define(["jquery"], pivotModule);
    } else {
      return pivotModule(jQuery);
    }
  };

  callWithJQuery(function($) {
    var SubtotalPivotData, SubtotalRenderer, aggregatorTemplates, subtotalAggregatorTemplates, usFmtPct;
    SubtotalPivotData = (function(superClass) {
      var processKey;

      extend(SubtotalPivotData, superClass);

      function SubtotalPivotData(input, opts) {
        SubtotalPivotData.__super__.constructor.call(this, input, opts);
      }

      processKey = function(record, totals, keys, attrs, getAggregator) {
        var addKey, attr, flatKey, k, key, len, ref;
        key = [];
        addKey = false;
        for (k = 0, len = attrs.length; k < len; k++) {
          attr = attrs[k];
          key.push((ref = record[attr]) != null ? ref : "null");
          flatKey = key.join(String.fromCharCode(0));
          if (!totals[flatKey]) {
            totals[flatKey] = getAggregator(key.slice());
            addKey = true;
          }
          totals[flatKey].push(record);
        }
        if (addKey) {
          keys.push(key);
        }
        return key;
      };

      SubtotalPivotData.prototype.processRecord = function(record) {
        var colKey, fColKey, fRowKey, flatColKey, flatRowKey, i, j, k, m, n, ref, results, rowKey;
        rowKey = [];
        colKey = [];
        this.allTotal.push(record);
        rowKey = processKey(record, this.rowTotals, this.rowKeys, this.rowAttrs, (function(_this) {
          return function(key) {
            return _this.aggregator(_this, key, []);
          };
        })(this));
        colKey = processKey(record, this.colTotals, this.colKeys, this.colAttrs, (function(_this) {
          return function(key) {
            return _this.aggregator(_this, [], key);
          };
        })(this));
        m = rowKey.length - 1;
        n = colKey.length - 1;
        if (m < 0 || n < 0) {
          return;
        }
        results = [];
        for (i = k = 0, ref = m; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          fRowKey = rowKey.slice(0, i + 1);
          flatRowKey = fRowKey.join(String.fromCharCode(0));
          if (!this.tree[flatRowKey]) {
            this.tree[flatRowKey] = {};
          }
          results.push((function() {
            var l, ref1, results1;
            results1 = [];
            for (j = l = 0, ref1 = n; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
              fColKey = colKey.slice(0, j + 1);
              flatColKey = fColKey.join(String.fromCharCode(0));
              if (!this.tree[flatRowKey][flatColKey]) {
                this.tree[flatRowKey][flatColKey] = this.aggregator(this, fRowKey, fColKey);
              }
              results1.push(this.tree[flatRowKey][flatColKey].push(record));
            }
            return results1;
          }).call(this));
        }
        return results;
      };

      return SubtotalPivotData;

    })($.pivotUtilities.PivotData);
    $.pivotUtilities.SubtotalPivotData = SubtotalPivotData;
    SubtotalRenderer = function(pivotData, opts) {
      var addClass, adjustAxisHeader, allTotal, arrowCollapsed, arrowExpanded, buildAxisHeader, buildColAxisHeaders, buildColHeader, buildColTotals, buildColTotalsHeader, buildGrandTotal, buildRowAxisHeaders, buildRowHeader, buildRowTotalsHeader, buildValues, classColCollapsed, classColExpanded, classColHide, classColShow, classCollapsed, classExpanded, classRowCollapsed, classRowExpanded, classRowHide, classRowShow, clickStatusCollapsed, clickStatusExpanded, colAttrs, colKeys, colTotals, collapseAxis, collapseAxisHeaders, collapseChildCol, collapseChildRow, collapseCol, collapseHiddenColSubtotal, collapseRow, collapseShowColSubtotal, collapseShowRowSubtotal, createElement, defaults, expandAxis, expandChildCol, expandChildRow, expandCol, expandHideColSubtotal, expandHideRowSubtotal, expandRow, expandShowColSubtotal, expandShowRowSubtotal, getHeaderText, getTableEventHandlers, hasClass, hideChildCol, hideChildRow, main, processKeys, removeClass, replaceClass, rowAttrs, rowKeys, rowTotals, setAttributes, showChildCol, showChildRow, tree;
      defaults = {
        table: {
          clickCallback: null
        },
        localeStrings: {
          totals: "Totals",
          subtotalOf: "Subtotal of"
        },
        arrowCollapsed: "\u25B6",
        arrowExpanded: "\u25E2",
        rowSubtotalDisplay: {
          displayOnTop: true,
          disableFrom: 99999,
          collapseAt: 99999,
          hideOnExpand: false,
          disableExpandCollapse: false
        },
        colSubtotalDisplay: {
          displayOnTop: true,
          disableFrom: 99999,
          collapseAt: 99999,
          hideOnExpand: false,
          disableExpandCollapse: false
        }
      };
      opts = $.extend(true, {}, defaults, opts);
      if (opts.rowSubtotalDisplay.disableSubtotal) {
        opts.rowSubtotalDisplay.disableFrom = 0;
      }
      if (typeof opts.rowSubtotalDisplay.disableAfter !== 'undefined' && opts.rowSubtotalDisplay.disableAfter !== null) {
        opts.rowSubtotalDisplay.disableFrom = opts.rowSubtotalDisplay.disableAfter + 1;
      }
      if (typeof opts.rowSubtotalDisplay.collapseAt !== 'undefined' && opts.collapseRowsAt !== null) {
        opts.rowSubtotalDisplay.collapseAt = opts.collapseRowsAt;
      }
      if (opts.colSubtotalDisplay.disableSubtotal) {
        opts.colSubtotalDisplay.disableFrom = 0;
      }
      if (typeof opts.colSubtotalDisplay.disableAfter !== 'undefined' && opts.colSubtotalDisplay.disableAfter !== null) {
        opts.colSubtotalDisplay.disableFrom = opts.colSubtotalDisplay.disableAfter + 1;
      }
      if (typeof opts.colSubtotalDisplay.collapseAt !== 'undefined' && opts.collapseColsAt !== null) {
        opts.colSubtotalDisplay.collapseAt = opts.collapseColsAt;
      }
      colAttrs = pivotData.colAttrs;
      rowAttrs = pivotData.rowAttrs;
      rowKeys = pivotData.getRowKeys();
      colKeys = pivotData.getColKeys();
      tree = pivotData.tree;
      rowTotals = pivotData.rowTotals;
      colTotals = pivotData.colTotals;
      allTotal = pivotData.allTotal;
      classRowHide = "rowhide";
      classRowShow = "rowshow";
      classColHide = "colhide";
      classColShow = "colshow";
      clickStatusExpanded = "expanded";
      clickStatusCollapsed = "collapsed";
      classExpanded = "expanded";
      classCollapsed = "collapsed";
      classRowExpanded = "rowexpanded";
      classRowCollapsed = "rowcollapsed";
      classColExpanded = "colexpanded";
      classColCollapsed = "colcollapsed";
      arrowExpanded = opts.arrowExpanded;
      arrowCollapsed = opts.arrowCollapsed;
      hasClass = function(element, className) {
        var regExp;
        regExp = new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
        return element.className.match(regExp) !== null;
      };
      removeClass = function(element, className) {
        var k, len, name, ref, regExp, results;
        ref = className.split(" ");
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          name = ref[k];
          regExp = new RegExp("(?:^|\\s)" + name + "(?!\\S)", "g");
          results.push(element.className = element.className.replace(regExp, ''));
        }
        return results;
      };
      addClass = function(element, className) {
        var k, len, name, ref, results;
        ref = className.split(" ");
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          name = ref[k];
          if (!hasClass(element, name)) {
            results.push(element.className += " " + name);
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      replaceClass = function(element, replaceClassName, byClassName) {
        removeClass(element, replaceClassName);
        return addClass(element, byClassName);
      };
      createElement = function(elementType, className, textContent, attributes, eventHandlers) {
        var attr, e, event, handler, val;
        e = document.createElement(elementType);
        if (className != null) {
          e.className = className;
        }
        if (textContent != null) {
          e.textContent = textContent;
        }
        if (attributes != null) {
          for (attr in attributes) {
            if (!hasProp.call(attributes, attr)) continue;
            val = attributes[attr];
            e.setAttribute(attr, val);
          }
        }
        if (eventHandlers != null) {
          for (event in eventHandlers) {
            if (!hasProp.call(eventHandlers, event)) continue;
            handler = eventHandlers[event];
            e.addEventListener(event, handler);
          }
        }
        return e;
      };
      setAttributes = function(e, attrs) {
        var a, results, v;
        results = [];
        for (a in attrs) {
          if (!hasProp.call(attrs, a)) continue;
          v = attrs[a];
          results.push(e.setAttribute(a, v));
        }
        return results;
      };
      processKeys = function(keysArr, className, opts) {
        var headers, lastIdx, row;
        lastIdx = keysArr[0].length - 1;
        headers = {
          children: []
        };
        row = 0;
        keysArr.reduce((function(_this) {
          return function(val0, k0) {
            var col;
            col = 0;
            k0.reduce(function(acc, curVal, curIdx, arr) {
              var i, k, key, node, ref;
              if (!acc[curVal]) {
                key = k0.slice(0, col + 1);
                acc[curVal] = {
                  row: row,
                  col: col,
                  descendants: 0,
                  children: [],
                  text: curVal,
                  key: key,
                  flatKey: key.join(String.fromCharCode(0)),
                  firstLeaf: null,
                  leaves: 0,
                  parent: col !== 0 ? acc : null,
                  th: createElement("th", className, curVal),
                  childrenSpan: 0
                };
                acc.children.push(curVal);
              }
              if (col > 0) {
                acc.descendants++;
              }
              col++;
              if (curIdx === lastIdx) {
                node = headers;
                for (i = k = 0, ref = lastIdx - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
                  if (!(lastIdx > 0)) {
                    continue;
                  }
                  node[k0[i]].leaves++;
                  if (!node[k0[i]].firstLeaf) {
                    node[k0[i]].firstLeaf = acc[curVal];
                  }
                  node = node[k0[i]];
                }
                return headers;
              }
              return acc[curVal];
            }, headers);
            row++;
            return headers;
          };
        })(this), headers);
        return headers;
      };
      buildAxisHeader = function(axisHeaders, col, attrs, opts) {
        var ah, arrow, hClass;
        ah = {
          text: attrs[col],
          expandedCount: 0,
          expandables: 0,
          attrHeaders: [],
          clickStatus: clickStatusExpanded,
          onClick: collapseAxis
        };
        arrow = arrowExpanded + " ";
        hClass = classExpanded;
        if (col >= opts.collapseAt) {
          arrow = arrowCollapsed + " ";
          hClass = classCollapsed;
          ah.clickStatus = clickStatusCollapsed;
          ah.onClick = expandAxis;
        }
        if (col === attrs.length - 1 || col >= opts.disableFrom || opts.disableExpandCollapse) {
          arrow = "";
        }
        ah.th = createElement("th", "pvtAxisLabel " + hClass, "" + arrow + ah.text);
        if (col < attrs.length - 1 && col < opts.disableFrom && !opts.disableExpandCollapse) {
          ah.th.onclick = function(event) {
            event = event || window.event;
            return ah.onClick(axisHeaders, col, attrs, opts);
          };
        }
        axisHeaders.ah.push(ah);
        return ah;
      };
      buildColAxisHeaders = function(thead, rowAttrs, colAttrs, opts) {
        var ah, attr, axisHeaders, col, k, len;
        axisHeaders = {
          collapseAttrHeader: collapseCol,
          expandAttrHeader: expandCol,
          ah: []
        };
        for (col = k = 0, len = colAttrs.length; k < len; col = ++k) {
          attr = colAttrs[col];
          ah = buildAxisHeader(axisHeaders, col, colAttrs, opts.colSubtotalDisplay);
          ah.tr = createElement("tr");
          if (col === 0 && rowAttrs.length !== 0) {
            ah.tr.appendChild(createElement("th", null, null, {
              colspan: rowAttrs.length,
              rowspan: colAttrs.length
            }));
          }
          ah.tr.appendChild(ah.th);
          thead.appendChild(ah.tr);
        }
        return axisHeaders;
      };
      buildRowAxisHeaders = function(thead, rowAttrs, colAttrs, opts) {
        var ah, axisHeaders, col, k, ref, th;
        axisHeaders = {
          collapseAttrHeader: collapseRow,
          expandAttrHeader: expandRow,
          ah: [],
          tr: createElement("tr")
        };
        for (col = k = 0, ref = rowAttrs.length - 1; 0 <= ref ? k <= ref : k >= ref; col = 0 <= ref ? ++k : --k) {
          ah = buildAxisHeader(axisHeaders, col, rowAttrs, opts.rowSubtotalDisplay);
          axisHeaders.tr.appendChild(ah.th);
        }
        if (colAttrs.length !== 0) {
          th = createElement("th");
          axisHeaders.tr.appendChild(th);
        }
        thead.appendChild(axisHeaders.tr);
        return axisHeaders;
      };
      getHeaderText = function(h, attrs, opts) {
        var arrow;
        arrow = " " + arrowExpanded + " ";
        if (h.col === attrs.length - 1 || h.col >= opts.disableFrom || opts.disableExpandCollapse || h.children.length === 0) {
          arrow = "";
        }
        return "" + arrow + h.text;
      };
      buildColHeader = function(axisHeaders, attrHeaders, h, rowAttrs, colAttrs, node, opts) {
        var ah, chKey, k, len, ref, ref1;
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          buildColHeader(axisHeaders, attrHeaders, h[chKey], rowAttrs, colAttrs, node, opts);
        }
        ah = axisHeaders.ah[h.col];
        ah.attrHeaders.push(h);
        h.node = node.counter;
        h.onClick = collapseCol;
        addClass(h.th, classColShow + " col" + h.row + " colcol" + h.col + " " + classColExpanded);
        h.th.setAttribute("data-colnode", h.node);
        if (h.children.length !== 0) {
          h.th.colSpan = h.childrenSpan;
        }
        if (h.children.length === 0 && rowAttrs.length !== 0) {
          h.th.rowSpan = 2;
        }
        h.th.textContent = getHeaderText(h, colAttrs, opts.colSubtotalDisplay);
        if (h.children.length !== 0 && h.col < opts.colSubtotalDisplay.disableFrom) {
          ah.expandables++;
          ah.expandedCount += 1;
          if (!opts.colSubtotalDisplay.hideOnExpand) {
            h.th.colSpan++;
          }
          if (!opts.colSubtotalDisplay.disableExpandCollapse) {
            h.th.onclick = function(event) {
              event = event || window.event;
              return h.onClick(axisHeaders, h, opts.colSubtotalDisplay);
            };
          }
          h.sTh = createElement("th", "pvtColLabelFiller " + classColShow + " col" + h.row + " colcol" + h.col + " " + classColExpanded);
          h.sTh.setAttribute("data-colnode", h.node);
          h.sTh.rowSpan = colAttrs.length - h.col;
          if (opts.colSubtotalDisplay.hideOnExpand) {
            replaceClass(h.sTh, classColShow, classColHide);
          }
          h[h.children[0]].tr.appendChild(h.sTh);
        }
        if ((ref1 = h.parent) != null) {
          ref1.childrenSpan += h.th.colSpan;
        }
        h.clickStatus = clickStatusExpanded;
        ah.tr.appendChild(h.th);
        h.tr = ah.tr;
        attrHeaders.push(h);
        return node.counter++;
      };
      buildRowTotalsHeader = function(tr, rowAttrs, colAttrs) {
        var th;
        th = createElement("th", "pvtTotalLabel rowTotal", opts.localeStrings.totals, {
          rowspan: colAttrs.length === 0 ? 1 : colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
        });
        return tr.appendChild(th);
      };
      buildRowHeader = function(tbody, axisHeaders, attrHeaders, h, rowAttrs, colAttrs, node, opts) {
        var ah, chKey, firstChild, k, len, ref, ref1;
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          buildRowHeader(tbody, axisHeaders, attrHeaders, h[chKey], rowAttrs, colAttrs, node, opts);
        }
        ah = axisHeaders.ah[h.col];
        ah.attrHeaders.push(h);
        h.node = node.counter;
        h.onClick = collapseRow;
        if (h.children.length !== 0) {
          firstChild = h[h.children[0]];
        }
        addClass(h.th, classRowShow + " row" + h.row + " rowcol" + h.col + " " + classRowExpanded);
        h.th.setAttribute("data-rownode", h.node);
        if (h.col === rowAttrs.length - 1 && colAttrs.length !== 0) {
          h.th.colSpan = 2;
        }
        if (h.children.length !== 0) {
          h.th.rowSpan = h.childrenSpan;
        }
        h.th.textContent = getHeaderText(h, rowAttrs, opts.rowSubtotalDisplay);
        h.tr = createElement("tr", "row" + h.row);
        h.tr.appendChild(h.th);
        if (h.children.length === 0) {
          tbody.appendChild(h.tr);
        } else {
          tbody.insertBefore(h.tr, firstChild.tr);
        }
        if (h.children.length !== 0 && h.col < opts.rowSubtotalDisplay.disableFrom) {
          ++ah.expandedCount;
          ++ah.expandables;
          if (!opts.rowSubtotalDisplay.disableExpandCollapse) {
            h.th.onclick = function(event) {
              event = event || window.event;
              return h.onClick(axisHeaders, h, opts.rowSubtotalDisplay);
            };
          }
          h.sTh = createElement("th", "pvtRowLabelFiller row" + h.row + " rowcol" + h.col + " " + classRowExpanded + " " + classRowShow);
          if (opts.rowSubtotalDisplay.hideOnExpand) {
            replaceClass(h.sTh, classRowShow, classRowHide);
          }
          h.sTh.setAttribute("data-rownode", h.node);
          h.sTh.colSpan = rowAttrs.length - (h.col + 1) + (colAttrs.length !== 0 ? 1 : 0);
          if (opts.rowSubtotalDisplay.displayOnTop) {
            h.tr.appendChild(h.sTh);
          } else {
            h.th.rowSpan += 1;
            h.sTr = createElement("tr", "row" + h.row);
            h.sTr.appendChild(h.sTh);
            tbody.appendChild(h.sTr);
          }
        }
        if (h.children.length !== 0) {
          h.th.rowSpan++;
        }
        if ((ref1 = h.parent) != null) {
          ref1.childrenSpan += h.th.rowSpan;
        }
        h.clickStatus = clickStatusExpanded;
        attrHeaders.push(h);
        return node.counter++;
      };
      getTableEventHandlers = function(value, rowKey, colKey, rowAttrs, colAttrs, opts) {
        var attr, event, eventHandlers, filters, handler, i, ref, ref1;
        if (!((ref = opts.table) != null ? ref.eventHandlers : void 0)) {
          return;
        }
        eventHandlers = {};
        ref1 = opts.table.eventHandlers;
        for (event in ref1) {
          if (!hasProp.call(ref1, event)) continue;
          handler = ref1[event];
          filters = {};
          for (i in colAttrs) {
            if (!hasProp.call(colAttrs, i)) continue;
            attr = colAttrs[i];
            if (colKey[i] != null) {
              filters[attr] = colKey[i];
            }
          }
          for (i in rowAttrs) {
            if (!hasProp.call(rowAttrs, i)) continue;
            attr = rowAttrs[i];
            if (rowKey[i] != null) {
              filters[attr] = rowKey[i];
            }
          }
          eventHandlers[event] = function(e) {
            return handler(e, value, filters, pivotData);
          };
        }
        return eventHandlers;
      };
      buildValues = function(tbody, colAttrHeaders, rowAttrHeaders, rowAttrs, colAttrs, opts) {
        var aggregator, ch, cls, k, l, len, len1, rCls, ref, results, rh, td, totalAggregator, tr, val;
        results = [];
        for (k = 0, len = rowAttrHeaders.length; k < len; k++) {
          rh = rowAttrHeaders[k];
          if (!(rh.col === rowAttrs.length - 1 || (rh.children.length !== 0 && rh.col < opts.rowSubtotalDisplay.disableFrom))) {
            continue;
          }
          rCls = "pvtVal row" + rh.row + " rowcol" + rh.col + " " + classRowExpanded;
          if (rh.children.length > 0) {
            rCls += " pvtRowSubtotal";
            rCls += opts.rowSubtotalDisplay.hideOnExpand ? " " + classRowHide : "  " + classRowShow;
          } else {
            rCls += " " + classRowShow;
          }
          tr = rh.sTr ? rh.sTr : rh.tr;
          for (l = 0, len1 = colAttrHeaders.length; l < len1; l++) {
            ch = colAttrHeaders[l];
            if (!(ch.col === colAttrs.length - 1 || (ch.children.length !== 0 && ch.col < opts.colSubtotalDisplay.disableFrom))) {
              continue;
            }
            aggregator = (ref = tree[rh.flatKey][ch.flatKey]) != null ? ref : {
              value: (function() {
                return null;
              }),
              format: function() {
                return "";
              }
            };
            val = aggregator.value();
            cls = " " + rCls + " col" + ch.row + " colcol" + ch.col + " " + classColExpanded;
            if (ch.children.length > 0) {
              cls += " pvtColSubtotal";
              cls += opts.colSubtotalDisplay.hideOnExpand ? " " + classColHide : " " + classColShow;
            } else {
              cls += " " + classColShow;
            }
            td = createElement("td", cls, aggregator.format(val), {
              "data-value": val,
              "data-rownode": rh.node,
              "data-colnode": ch.node
            }, getTableEventHandlers(val, rh.key, ch.key, rowAttrs, colAttrs, opts));
            tr.appendChild(td);
          }
          totalAggregator = rowTotals[rh.flatKey];
          val = totalAggregator.value();
          td = createElement("td", "pvtTotal rowTotal " + rCls, totalAggregator.format(val), {
            "data-value": val,
            "data-row": "row" + rh.row,
            "data-rowcol": "col" + rh.col,
            "data-rownode": rh.node
          });
          getTableEventHandlers(val, rh.key, [], rowAttrs, colAttrs, opts);
          results.push(tr.appendChild(td));
        }
        return results;
      };
      buildColTotalsHeader = function(rowAttrs, colAttrs) {
        var colspan, th, tr;
        tr = createElement("tr");
        colspan = rowAttrs.length + (colAttrs.length === 0 ? 0 : 1);
        th = createElement("th", "pvtTotalLabel colTotal", opts.localeStrings.totals, {
          colspan: colspan
        });
        tr.appendChild(th);
        return tr;
      };
      buildColTotals = function(tr, attrHeaders, rowAttrs, colAttrs, opts) {
        var clsNames, h, k, len, results, td, totalAggregator, val;
        results = [];
        for (k = 0, len = attrHeaders.length; k < len; k++) {
          h = attrHeaders[k];
          if (!(h.col === colAttrs.length - 1 || (h.children.length !== 0 && h.col < opts.colSubtotalDisplay.disableFrom))) {
            continue;
          }
          clsNames = "pvtVal pvtTotal colTotal " + classColExpanded + " col" + h.row + " colcol" + h.col;
          if (h.children.length !== 0) {
            clsNames += " pvtColSubtotal";
            clsNames += opts.colSubtotalDisplay.hideOnExpand ? " " + classColHide : " " + classColShow;
          } else {
            clsNames += " " + classColShow;
          }
          totalAggregator = colTotals[h.flatKey];
          val = totalAggregator.value();
          td = createElement("td", clsNames, totalAggregator.format(val), {
            "data-value": val,
            "data-for": "col" + h.col,
            "data-colnode": "" + h.node
          }, getTableEventHandlers(val, [], h.key, rowAttrs, colAttrs, opts));
          results.push(tr.appendChild(td));
        }
        return results;
      };
      buildGrandTotal = function(tbody, tr, rowAttrs, colAttrs, opts) {
        var td, totalAggregator, val;
        totalAggregator = allTotal;
        val = totalAggregator.value();
        td = createElement("td", "pvtGrandTotal", totalAggregator.format(val), {
          "data-value": val
        }, getTableEventHandlers(val, [], [], rowAttrs, colAttrs, opts));
        tr.appendChild(td);
        return tbody.appendChild(tr);
      };
      collapseAxisHeaders = function(axisHeaders, col, opts) {
        var ah, collapsible, i, k, ref, ref1, results;
        collapsible = Math.min(axisHeaders.ah.length - 2, opts.disableFrom - 1);
        if (col > collapsible) {
          return;
        }
        results = [];
        for (i = k = ref = col, ref1 = collapsible; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          ah = axisHeaders.ah[i];
          replaceClass(ah.th, classExpanded, classCollapsed);
          ah.th.textContent = " " + arrowCollapsed + " " + ah.text;
          ah.clickStatus = clickStatusCollapsed;
          results.push(ah.onClick = expandAxis);
        }
        return results;
      };
      adjustAxisHeader = function(axisHeaders, col, opts) {
        var ah;
        ah = axisHeaders.ah[col];
        if (ah.expandedCount === 0) {
          return collapseAxisHeaders(axisHeaders, col, opts);
        } else if (ah.expandedCount === ah.expandables) {
          replaceClass(ah.th, classCollapsed, classExpanded);
          ah.th.textContent = " " + arrowExpanded + " " + ah.text;
          ah.clickStatus = clickStatusExpanded;
          return ah.onClick = collapseAxis;
        }
      };
      hideChildCol = function(ch) {
        return $(ch.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + ch.node + "\"], th[data-colnode=\"" + ch.node + "\"]").removeClass(classColShow).addClass(classColHide);
      };
      collapseHiddenColSubtotal = function(h, opts) {
        $(h.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + h.node + "\"], th[data-colnode=\"" + h.node + "\"]").removeClass(classColExpanded).addClass(classColCollapsed);
        if (h.children.length !== 0) {
          h.th.textContent = " " + arrowCollapsed + " " + h.text;
        }
        return h.th.colSpan = 1;
      };
      collapseShowColSubtotal = function(h, opts) {
        $(h.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + h.node + "\"], th[data-colnode=\"" + h.node + "\"]").removeClass(classColExpanded).addClass(classColCollapsed).removeClass(classColHide).addClass(classColShow);
        if (h.children.length !== 0) {
          h.th.textContent = " " + arrowCollapsed + " " + h.text;
        }
        return h.th.colSpan = 1;
      };
      collapseChildCol = function(ch, h) {
        var chKey, k, len, ref;
        ref = ch.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          if (hasClass(ch[chKey].th, classColShow)) {
            collapseChildCol(ch[chKey], h);
          }
        }
        return hideChildCol(ch);
      };
      collapseCol = function(axisHeaders, h, opts) {
        var chKey, colSpan, k, len, p, ref;
        colSpan = h.th.colSpan - 1;
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          if (hasClass(h[chKey].th, classColShow)) {
            collapseChildCol(h[chKey], h);
          }
        }
        if (h.col < opts.disableFrom) {
          if (hasClass(h.th, classColHide)) {
            collapseHiddenColSubtotal(h, opts);
          } else {
            collapseShowColSubtotal(h, opts);
          }
        }
        p = h.parent;
        while (p) {
          p.th.colSpan -= colSpan;
          p = p.parent;
        }
        h.clickStatus = clickStatusCollapsed;
        h.onClick = expandCol;
        axisHeaders.ah[h.col].expandedCount--;
        return adjustAxisHeader(axisHeaders, h.col, opts);
      };
      showChildCol = function(ch) {
        return $(ch.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + ch.node + "\"], th[data-colnode=\"" + ch.node + "\"]").removeClass(classColHide).addClass(classColShow);
      };
      expandHideColSubtotal = function(h) {
        $(h.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + h.node + "\"], th[data-colnode=\"" + h.node + "\"]").removeClass(classColCollapsed + " " + classColShow).addClass(classColExpanded + " " + classColHide);
        replaceClass(h.th, classColHide, classColShow);
        return h.th.textContent = " " + arrowExpanded + " " + h.text;
      };
      expandShowColSubtotal = function(h) {
        $(h.th).closest('table.pvtTable').find("tbody tr td[data-colnode=\"" + h.node + "\"], th[data-colnode=\"" + h.node + "\"]").removeClass(classColCollapsed + " " + classColHide).addClass(classColExpanded + " " + classColShow);
        h.th.colSpan++;
        return h.th.textContent = " " + arrowExpanded + " " + h.text;
      };
      expandChildCol = function(ch, opts) {
        var chKey, k, len, ref, results;
        if (ch.children.length !== 0 && opts.hideOnExpand && ch.clickStatus === clickStatusExpanded) {
          replaceClass(ch.th, classColHide, classColShow);
        } else {
          showChildCol(ch);
        }
        if (ch.sTh && ch.clickStatus === clickStatusExpanded && opts.hideOnExpand) {
          replaceClass(ch.sTh, classColShow, classColHide);
        }
        if (ch.clickStatus === clickStatusExpanded || ch.col >= opts.disableFrom) {
          ref = ch.children;
          results = [];
          for (k = 0, len = ref.length; k < len; k++) {
            chKey = ref[k];
            results.push(expandChildCol(ch[chKey], opts));
          }
          return results;
        }
      };
      expandCol = function(axisHeaders, h, opts) {
        var ch, chKey, colSpan, k, len, p, ref;
        if (h.clickStatus === clickStatusExpanded) {
          adjustAxisHeader(axisHeaders, h.col, opts);
          return;
        }
        colSpan = 0;
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          ch = h[chKey];
          expandChildCol(ch, opts);
          colSpan += ch.th.colSpan;
        }
        h.th.colSpan = colSpan;
        if (h.col < opts.disableFrom) {
          if (opts.hideOnExpand) {
            expandHideColSubtotal(h);
            --colSpan;
          } else {
            expandShowColSubtotal(h);
          }
        }
        p = h.parent;
        while (p) {
          p.th.colSpan += colSpan;
          p = p.parent;
        }
        h.clickStatus = clickStatusExpanded;
        h.onClick = collapseCol;
        axisHeaders.ah[h.col].expandedCount++;
        return adjustAxisHeader(axisHeaders, h.col, opts);
      };
      hideChildRow = function(ch, opts) {
        var cell, k, l, len, len1, ref, ref1, results;
        ref = ch.tr.querySelectorAll("th, td");
        for (k = 0, len = ref.length; k < len; k++) {
          cell = ref[k];
          replaceClass(cell, classRowShow, classRowHide);
        }
        if (ch.sTr) {
          ref1 = ch.sTr.querySelectorAll("th, td");
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            cell = ref1[l];
            results.push(replaceClass(cell, classRowShow, classRowHide));
          }
          return results;
        }
      };
      collapseShowRowSubtotal = function(h, opts) {
        var cell, k, l, len, len1, ref, ref1, results;
        h.th.textContent = " " + arrowCollapsed + " " + h.text;
        ref = h.tr.querySelectorAll("th, td");
        for (k = 0, len = ref.length; k < len; k++) {
          cell = ref[k];
          removeClass(cell, classRowExpanded + " " + classRowHide);
          addClass(cell, classRowCollapsed + " " + classRowShow);
        }
        if (h.sTr) {
          ref1 = h.sTr.querySelectorAll("th, td");
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            cell = ref1[l];
            removeClass(cell, classRowExpanded + " " + classRowHide);
            results.push(addClass(cell, classRowCollapsed + " " + classRowShow));
          }
          return results;
        }
      };
      collapseChildRow = function(ch, h, opts) {
        var chKey, k, len, ref;
        ref = ch.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          collapseChildRow(ch[chKey], h, opts);
        }
        return hideChildRow(ch, opts);
      };
      collapseRow = function(axisHeaders, h, opts) {
        var chKey, k, len, ref;
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          collapseChildRow(h[chKey], h, opts);
        }
        collapseShowRowSubtotal(h, opts);
        h.clickStatus = clickStatusCollapsed;
        h.onClick = expandRow;
        axisHeaders.ah[h.col].expandedCount--;
        return adjustAxisHeader(axisHeaders, h.col, opts);
      };
      showChildRow = function(ch, opts) {
        var cell, k, l, len, len1, ref, ref1, results;
        ref = ch.tr.querySelectorAll("th, td");
        for (k = 0, len = ref.length; k < len; k++) {
          cell = ref[k];
          replaceClass(cell, classRowHide, classRowShow);
        }
        if (ch.sTr) {
          ref1 = ch.sTr.querySelectorAll("th, td");
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            cell = ref1[l];
            results.push(replaceClass(cell, classRowHide, classRowShow));
          }
          return results;
        }
      };
      expandShowRowSubtotal = function(h, opts) {
        var cell, k, l, len, len1, ref, ref1, results;
        h.th.textContent = " " + arrowExpanded + " " + h.text;
        ref = h.tr.querySelectorAll("th, td");
        for (k = 0, len = ref.length; k < len; k++) {
          cell = ref[k];
          removeClass(cell, classRowCollapsed + " " + classRowHide);
          addClass(cell, classRowExpanded + " " + classRowShow);
        }
        if (h.sTr) {
          ref1 = h.sTr.querySelectorAll("th, td");
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            cell = ref1[l];
            removeClass(cell, classRowCollapsed + " " + classRowHide);
            results.push(addClass(cell, classRowExpanded + " " + classRowShow));
          }
          return results;
        }
      };
      expandHideRowSubtotal = function(h, opts) {
        var cell, k, l, len, len1, ref, ref1, results;
        h.th.textContent = " " + arrowExpanded + " " + h.text;
        ref = h.tr.querySelectorAll("th, td");
        for (k = 0, len = ref.length; k < len; k++) {
          cell = ref[k];
          removeClass(cell, classRowCollapsed + " " + classRowShow);
          addClass(cell, classRowExpanded + " " + classRowHide);
        }
        removeClass(h.th, classRowCollapsed + " " + classRowHide);
        addClass(cell, classRowExpanded + " " + classRowShow);
        if (h.sTr) {
          ref1 = h.sTr.querySelectorAll("th, td");
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            cell = ref1[l];
            removeClass(cell, classRowCollapsed + " " + classRowShow);
            results.push(addClass(cell, classRowExpanded + " " + classRowHide));
          }
          return results;
        }
      };
      expandChildRow = function(ch, opts) {
        var chKey, k, len, ref, results;
        if (ch.children.length !== 0 && opts.hideOnExpand && ch.clickStatus === clickStatusExpanded) {
          replaceClass(ch.th, classRowHide, classRowShow);
        } else {
          showChildRow(ch, opts);
        }
        if (ch.sTh && ch.clickStatus === clickStatusExpanded && opts.hideOnExpand) {
          replaceClass(ch.sTh, classRowShow, classRowHide);
        }
        if (ch.clickStatus === clickStatusExpanded || ch.col >= opts.disableFrom) {
          ref = ch.children;
          results = [];
          for (k = 0, len = ref.length; k < len; k++) {
            chKey = ref[k];
            results.push(expandChildRow(ch[chKey], opts));
          }
          return results;
        }
      };
      expandRow = function(axisHeaders, h, opts) {
        var ch, chKey, k, len, ref;
        if (h.clickStatus === clickStatusExpanded) {
          adjustAxisHeader(axisHeaders, h.col, opts);
          return;
        }
        ref = h.children;
        for (k = 0, len = ref.length; k < len; k++) {
          chKey = ref[k];
          ch = h[chKey];
          expandChildRow(ch, opts);
        }
        if (h.children.length !== 0) {
          if (opts.hideOnExpand) {
            expandHideRowSubtotal(h, opts);
          } else {
            expandShowRowSubtotal(h, opts);
          }
        }
        h.clickStatus = clickStatusExpanded;
        h.onClick = collapseRow;
        axisHeaders.ah[h.col].expandedCount++;
        return adjustAxisHeader(axisHeaders, h.col, opts);
      };
      collapseAxis = function(axisHeaders, col, attrs, opts) {
        var collapsible, h, i, k, ref, ref1, results;
        collapsible = Math.min(attrs.length - 2, opts.disableFrom - 1);
        if (col > collapsible) {
          return;
        }
        results = [];
        for (i = k = ref = collapsible, ref1 = col; k >= ref1; i = k += -1) {
          results.push((function() {
            var l, len, ref2, results1;
            ref2 = axisHeaders.ah[i].attrHeaders;
            results1 = [];
            for (l = 0, len = ref2.length; l < len; l++) {
              h = ref2[l];
              if (h.clickStatus === clickStatusExpanded && h.children.length !== 0) {
                results1.push(axisHeaders.collapseAttrHeader(axisHeaders, h, opts));
              }
            }
            return results1;
          })());
        }
        return results;
      };
      expandAxis = function(axisHeaders, col, attrs, opts) {
        var ah, h, i, k, ref, results;
        ah = axisHeaders.ah[col];
        results = [];
        for (i = k = 0, ref = col; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          results.push((function() {
            var l, len, ref1, results1;
            ref1 = axisHeaders.ah[i].attrHeaders;
            results1 = [];
            for (l = 0, len = ref1.length; l < len; l++) {
              h = ref1[l];
              results1.push(axisHeaders.expandAttrHeader(axisHeaders, h, opts));
            }
            return results1;
          })());
        }
        return results;
      };
      main = function(rowAttrs, rowKeys, colAttrs, colKeys) {
        var chKey, colAttrHeaders, colAxisHeaders, colKeyHeaders, k, l, len, len1, node, ref, ref1, result, rowAttrHeaders, rowAxisHeaders, rowKeyHeaders, tbody, thead, tr;
        rowAttrHeaders = [];
        colAttrHeaders = [];
        if (colAttrs.length !== 0 && colKeys.length !== 0) {
          colKeyHeaders = processKeys(colKeys, "pvtColLabel");
        }
        if (rowAttrs.length !== 0 && rowKeys.length !== 0) {
          rowKeyHeaders = processKeys(rowKeys, "pvtRowLabel");
        }
        result = createElement("table", "pvtTable", null, {
          style: "display: none;"
        });
        thead = createElement("thead");
        result.appendChild(thead);
        if (colAttrs.length !== 0) {
          colAxisHeaders = buildColAxisHeaders(thead, rowAttrs, colAttrs, opts);
          node = {
            counter: 0
          };
          ref = colKeyHeaders.children;
          for (k = 0, len = ref.length; k < len; k++) {
            chKey = ref[k];
            buildColHeader(colAxisHeaders, colAttrHeaders, colKeyHeaders[chKey], rowAttrs, colAttrs, node, opts);
          }
          buildRowTotalsHeader(colAxisHeaders.ah[0].tr, rowAttrs, colAttrs);
        }
        tbody = createElement("tbody");
        result.appendChild(tbody);
        if (rowAttrs.length !== 0) {
          rowAxisHeaders = buildRowAxisHeaders(thead, rowAttrs, colAttrs, opts);
          if (colAttrs.length === 0) {
            buildRowTotalsHeader(rowAxisHeaders.tr, rowAttrs, colAttrs);
          }
          node = {
            counter: 0
          };
          ref1 = rowKeyHeaders.children;
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            chKey = ref1[l];
            buildRowHeader(tbody, rowAxisHeaders, rowAttrHeaders, rowKeyHeaders[chKey], rowAttrs, colAttrs, node, opts);
          }
        }
        buildValues(tbody, colAttrHeaders, rowAttrHeaders, rowAttrs, colAttrs, opts);
        tr = buildColTotalsHeader(rowAttrs, colAttrs);
        if (colAttrs.length > 0) {
          buildColTotals(tr, colAttrHeaders, rowAttrs, colAttrs, opts);
        }
        buildGrandTotal(tbody, tr, rowAttrs, colAttrs, opts);
        collapseAxis(colAxisHeaders, opts.colSubtotalDisplay.collapseAt, colAttrs, opts.colSubtotalDisplay);
        collapseAxis(rowAxisHeaders, opts.rowSubtotalDisplay.collapseAt, rowAttrs, opts.rowSubtotalDisplay);
        result.setAttribute("data-numrows", rowKeys.length);
        result.setAttribute("data-numcols", colKeys.length);
        result.style.display = "";
        return result;
      };
      return main(rowAttrs, rowKeys, colAttrs, colKeys);
    };
    $.pivotUtilities.subtotal_renderers = {
      "Table With Subtotal": function(pvtData, opts) {
        return SubtotalRenderer(pvtData, opts);
      },
      "Table With Subtotal Bar Chart": function(pvtData, opts) {
        return $(SubtotalRenderer(pvtData, opts)).barchart();
      },
      "Table With Subtotal Heatmap": function(pvtData, opts) {
        return $(SubtotalRenderer(pvtData, opts)).heatmap("heatmap", opts);
      },
      "Table With Subtotal Row Heatmap": function(pvtData, opts) {
        return $(SubtotalRenderer(pvtData, opts)).heatmap("rowheatmap", opts);
      },
      "Table With Subtotal Col Heatmap": function(pvtData, opts) {
        return $(SubtotalRenderer(pvtData, opts)).heatmap("colheatmap", opts);
      }
    };
    usFmtPct = $.pivotUtilities.numberFormat({
      digitsAfterDecimal: 1,
      scaler: 100,
      suffix: "%"
    });
    aggregatorTemplates = $.pivotUtilities.aggregatorTemplates;
    subtotalAggregatorTemplates = {
      fractionOf: function(wrapped, type, formatter) {
        if (type == null) {
          type = "row";
        }
        if (formatter == null) {
          formatter = usFmtPct;
        }
        return function() {
          var x;
          x = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return function(data, rowKey, colKey) {
            if (typeof rowKey === "undefined") {
              rowKey = [];
            }
            if (typeof colKey === "undefined") {
              colKey = [];
            }
            return {
              selector: {
                row: [rowKey.slice(0, -1), []],
                col: [[], colKey.slice(0, -1)]
              }[type],
              inner: wrapped.apply(null, x)(data, rowKey, colKey),
              push: function(record) {
                return this.inner.push(record);
              },
              format: formatter,
              value: function() {
                return this.inner.value() / data.getAggregator.apply(data, this.selector).inner.value();
              },
              numInputs: wrapped.apply(null, x)().numInputs
            };
          };
        };
      }
    };
    $.pivotUtilities.subtotalAggregatorTemplates = subtotalAggregatorTemplates;
    return $.pivotUtilities.subtotal_aggregators = (function(tpl, sTpl) {
      return {
        "Sum As Fraction Of Parent Row": sTpl.fractionOf(tpl.sum(), "row", usFmtPct),
        "Sum As Fraction Of Parent Column": sTpl.fractionOf(tpl.sum(), "col", usFmtPct),
        "Count As Fraction Of Parent Row": sTpl.fractionOf(tpl.count(), "row", usFmtPct),
        "Count As Fraction Of Parent Column": sTpl.fractionOf(tpl.count(), "col", usFmtPct)
      };
    })(aggregatorTemplates, subtotalAggregatorTemplates);
  });

}).call(this);

//# sourceMappingURL=subtotal.js.map
