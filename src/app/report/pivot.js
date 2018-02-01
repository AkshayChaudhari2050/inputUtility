$(document).ready(function () {
  var fromdate, Todate, Hospital;
  $("#submit").click(function () {
    debugger;
    fromdate = '12-01-2017';
    Todate = '12-31-2017';
    Hospital = 'GRACE';
    $.post("http://localhost:5000/api/report/GetDailyBatch", {
      fromdate: fromdate,
      Todate: Todate,
      Hospital: Hospital
    }, function (data) {
      // var tpl = $.pivotUtilities.aggregatorTemplates;
      var sum = $.pivotUtilities.aggregatorTemplates.sum;
      var numberFormat = $.pivotUtilities.numberFormat;
      var intFormat = numberFormat({
        digitsAfterDecimal: 2
      });
      var dataClass = $.pivotUtilities.SubtotalPivotData;
      var renderer = $.pivotUtilities.subtotal_renderers["Table With Subtotal"];

      $("#output").pivot(data, {
        dataClass: dataClass,
        rows: ["TransactionDate"],
        cols: ["Hospital", "ReportType", "DaysType", "PackageType"],
        aggregator: sum(intFormat)(["UsedDays"]),
        renderer: renderer
        // rendererName: "Table With Subtotal"
      });
    });
  });
});


var string = "<script type=\"text\/javascript\"> ";
    string += "function hello (val)";
    string += "{";
    string += "alert('hello ' + val);";
    string += "}";
    string += "<\/script>";
string = string.replace(/<(script|\/script).*?>/g,'');
function createFunction() {
    var elem = document.getElementById("dynamicDiv");
    var script = document.createElement('script');
    script.innerHTML = string;
    elem.appendChild(script);
    hello("World 1");
}
createFunction()
hello('world 2');