$.extend({
    sr_edit_dialog: function (url, data, fn) {
        var u, d, f;
        if (arguments.length == 0) {
            $.messager.alert("错误", "错误:未填写发送请求地址！", "error");
        }
        else {

            if (arguments.length == 1) {
                u = url;
                d = {};
                f = function () { }
            }
            if (arguments.length == 2) {
                u = url;
                if ($.isFunction(data)) {
                    d = {};
                    f = data;
                } else {
                    d = data;
                    f = function () { }
                }
            }
            if (arguments.length == 3) {
                u = url;
                d = data;
                f = fn;
            }

            $(".sr_edit_dialog").dialog('destroy').remove();
            $("body").append('<div class="sr_edit_dialog"></div>');
            $.messager.progress();
            $('.sr_edit_dialog').load(u, d, function () {
                $.messager.progress("close");
                var dg = $('.sr_edit_dialog');
                var fm;
                if (d.title != null) {
                    dg.dialog({ title: d.title });
                }
                //表单
                if (d.form == null) {
                    fm = $('.sr_edit_dialog').find("form:first");
                } else {
                    fm = $('.sr_edit_dialog').find("form#" + d.form);
                }
                if (fm.length == 0) {
                    $.messager.alert("错误", "错误:<br /> 表单名-" + d.form + "不存在！", "error");
                    $(".sr_edit_dialog").dialog('destroy').remove();
                } else {
                    //是否最大化
                    var mz = false;
                    if (d.maximized == true) {
                        mz = true;
                    }
                    var md = false;
                    if (d.modal == true) {
                        md = true;
                    }
                    var mzb = false;
                    if (d.maximizable == true) {
                        mzb = true;
                    }
                    var rz = true;
                    if (d.resizable == false) {
                        rz = false;
                    }
                    var wt = 300;
                    if (d.width == undefined || d.width == null) {
                        wt = 300;
                    } else {
                        wt = d.width;
                    } 
                    dg.dialog({
                        iconCls: 'icon-page_edit', modal: md, maximizable: mzb, maximized: mz, resizable: rz,width:wt,
                        buttons: [{
                            text: "保存",
                            iconCls: 'icon-disk',modal:true,
                            handler: function () {
                                //提交表单
                                fm.form('submit', {
                                    url: fm.attr("action"),
                                    onSubmit: function () {
                                        return fm.form("validate")
                                    },
                                    success: function (data) {
                                        dg.dialog('destroy');
                                        f(data);
                                    }
                                });
                            }
                        }, {
                            text: "取消",
                            iconCls: 'icon-cross',
                            handler: function () {
                                dg.dialog('destroy');
                            }
                        }]
                    });
                }
            });
        }
    }
});