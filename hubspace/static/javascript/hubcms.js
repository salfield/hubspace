var set_ajax_globals = function () {
    jq('#throbber').ajaxStart(function () {
        overlib(jq(this).html());
        jq('#throbber').oneTime("20s", "kill_loader", nd);
    }).ajaxStop(function () {
        nd();
    }).ajaxError(function () {
        nd();
    });
};
var xmllib = {};
jq.extend(xmllib, {
    escape: function (content) {
        content = content.replace(new RegExp('&', 'g'), '&amp;');
        content = content.replace(new RegExp('<', 'g'), '&lt;');
        content = content.replace(new RegExp('>', 'g'), '&gt;');
        return content;
    },
    unescape: function (content) {
        content = content.replace(new RegExp('&gt;', 'g'), '>');
        content = content.replace(new RegExp('&lt;', 'g'), '<');
        content = content.replace(new RegExp('&amp;', 'g'), '&');
        return content;
    }
});
String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};
String.prototype.stripTags = function () {
    if (this === '' || !this) {
        return '';
    }
    var str = this.replace(/<\/?[^>]+>/gi, '');
    return str;
};

var widget = {};
jq.extend(widget, {
    create: function (form, type, label, widget_id, widget_name, widget_class, value, css) {
        if (!type) {
            type = 'text_small';
        }
        if (!label) {
            label = 'Text';
        }
        if (!widget_id) {
            widget_id = '';
        }
        if (!widget_class) {
            widget_class = 'widget';
        }
        if (!value) {
            value = '';
        }
        if (!widget[type]) {
            return null;
        }
        var widget_ele = widget[type](widget_id, widget_name, widget_class, value, css, form);
        if (!form.find('#' + widget_id).length) {
            widget_ele[0].appendTo(form);
        }
        return widget_ele;
    },
    gmap: function (widget_id, widget_name, widget_class, value, css, form) {
        var input = jq('<input type="text" value="{value}" id="{widget_id}" class="{widget_class}" name="{widget_name}" />'.supplant({'value': value, 'widget_id': widget_id,  'widget_class': widget_class, 'widget_name': widget_name}));
        var map = jq('<div id="{widget_id}_editable_map" class="gmap">{value}</div>'.supplant({'widget_id': widget_id, 'value': value})).css(css);
        var help = jq('<div class="map_help">Drag the marker or write your address to set your location then press "save" when you are ready.</div>');
        return [input, [map, help]];
    },
    text_wysiwyg_small: function (widget_id, widget_name, widget_class, value, css, form) {
        var toolbar_config =  {toolbar: {titlebar: false,
                                         buttons: [
                                             { group: 'textstyle',
                                                  buttons: [
                                                     { type: 'push', label: 'Bold CTRL + SHIFT + B', value: 'bold' },
                                                     { type: 'push', label: 'Italic CTRL + SHIFT + I', value: 'italic' },
                                                     { type: 'push', label: 'Underline CTRL + SHIFT + U', value: 'underline' },
                                                     { type: 'push', label: 'HTML Link CTRL + SHIFT + L', value: 'createlink', disabled: true },
                                                     { type: 'push', label: 'Insert Image', value: 'insertimage' },
                                                     { type: 'select', label: 'Normal', value: 'heading', disabled: true, menu: [
                                                         { text: 'Normal', value: 'none', checked: true },
                                                         { text: 'Header 1', value: 'h1' },
                                                         { text: 'Header 2', value: 'h2' },
                                                         { text: 'Header 3', value: 'h3' },
                                                         { text: 'Header 4', value: 'h4' }
                                                     ]},
                                                     { type: 'push', label: 'Create an Unordered List', value: 'insertunorderedlist' },
                                                     { type: 'push', label: 'Create an Ordered List', value: 'insertorderedlist' }

                                             ]}
                                          ]}
                              };

        return widget.wysiwyg(widget_id, widget_name, widget_class, value, css, form, toolbar_config);
    },
    text_wysiwyg: function (widget_id, widget_name, widget_class, value, css, form) {
        var toolbar_config = {};
        return widget.wysiwyg(widget_id, widget_name, widget_class, value, css, form, toolbar_config);
    },
    wysiwyg: function (widget_id, widget_name, widget_class, value, css, form, toolbar_config) {
        var element = widget.text_large(widget_id, widget_name, widget_class, value, css)[0];
        css.width -= 20;
	element.appendTo(form);
        css.height = Math.max(css.height, 50);
        css.width = Math.max(css.width, 100);
        var config = {
            height: css.height,
            width: css.width,
            dompath: true, //Turns on the bar at the bottom
            animate: true //Animates the opening, closing and moving of Editor windows
        };
        jq.extend(config, toolbar_config);
        var myEditor =  toggle_editor(config, widget_id);
        myEditor.render();
        return [element, myEditor];
    },
    text_large: function (widget_id, widget_name, widget_class, value, css) {
        css.height = Math.max(css.height, 50);
        css.width -= 20;
        css.width = Math.max(css.width, 100);
        var element = jq('<textarea></textarea>').attr({id: widget_id,
                                                    name: widget_name}).addClass(widget_class).val(value).css(css);
        return [element, null];
    },
    text_small: function (widget_id, widget_name, widget_class, value, css) {
        css.width = Math.max(css.width, 80);
        var ele = jq('<input type="text" />').attr({id: widget_id,
                                                   name: widget_name}).addClass(widget_class).val(value).css('width', css.width);
        return [ele, null];
    },
    time_range_select: function (widget_id, widget_name, widget_class, value) {
        value = value.split('-');
        var start_time = value[0];
        var end_time = value[1];
        var start = document.createElement('input');
        start.id = widget_id + '_start';
        start.name = widget_name + '_start';
        start.type = 'hidden';
        start.className = widget_class;
        start.value = start_time;
        var end = document.createElement('input');
        end.id = widget_id + '_end';
        end.name = widget_name + '_end';
        end.type = 'hidden';
        end.className = widget_class;
        end.value = end_time;
        var both = document.createElement('div');
        both.appendChild(start);
        both.appendChild(end);
        return [both, null];
    },
    select: function (widget_id, widget_name, widget_class, value) {
        /*this is just for using once, needs to be generalised later
        source should be a hashtable and should be taken from the server as json*/
        var source = ['room', 'hotdesk', 'phone', 'printer', 'custom', 'other'];
        var element = jq('<select id="{id}" name="{name}" class="{className}" >'.supplant({id: widget_id,
                                                                                           name: widget_name,
                                                                                           className: widget_class}));
        jq.each(source, function (i, val) {
           widget.add_option(val, element);
        });
        return [element, null];
    },
    add_option: function (val, element) {
        var ele = jq('<option></option>');
        ele.val(val);
        ele.html(val);
        if (this === val) {
            ele.selected = 'selected';
        }
        ele.appendTo(element);
    }
});
var inplace_editor = function (element_id, url, special_options) {
    var element = jq('#' + element_id);
    var height = (element.height() + element.height() / 10);
    var width = element.width() || 60;
    var trigger = element;
    var editField = null;
    var js_widget = null;
    var form = null;
    var value = "";
    var oldInnerHTML = "";
    var saving = false;
    var loading = false;
    var editing = false;
    var elementTop = 0;
    var widget_ready = false;
    if (special_options.externalControl) {
        trigger = jq('#' + special_options.externalControl);
    }
    var options = jq.extend({
        okText: "ok",
        cancelText: "cancel",
        savingText: "Saving...",
        clickToEditText: "Click here to edit",
        edit_event: 'click',
        rows: 1,
        onComplete: function (data, element) {
            element.click(function () {
                jq(this).effect("highlight", {}, 1000);
            });
        },
        onFailure: function (xhr) {
            alert("Error communicating with the server: " + xhr.responseText.stripTags());
        },
        onCancel: null,
        callback: function (form) {
            return form.serializeArray();
        },
        handleLineBreaks: true,
        loadingText: 'Loading...',
        savingClassName: 'inplaceeditor-saving',
        loadingClassName: 'inplaceeditor_loading',
        formClassName: 'inplaceeditor-form',
        highlightcolor: "#ffff99",
        trigger: trigger,
        ajaxOptions: {},
        template_args: {}
    }, special_options || {});
    var formId = '{element}-inplaceeditor'.supplant({element: element_id});
    if (!formId && element.id) {
        formId = '#' + element.id + "-inplaceeditor";
        if (jq(formId)) {
            // there's already a form with that name, don't specify an id
            alert("duplicate form error");
            return;
        }
    }
    trigger.attr('title', options.clickToEditText);
    var enterEditMode = function () {
        elementTop = jq(window).scrollTop();
        element.stop().css('background-color', '#EEE');
        if (saving) {
            return false;
        }
        if (editing) {
            return false;
        }
        editing = true;
        onEnterEditMode();
        trigger.hide();
        element.hide();
        if (!form) {
            createForm();
        }
        return false;
    };
    var init = function () {
        trigger.one(options.edit_event, enterEditMode);
        trigger.mouseover(enterHover);
        trigger.mouseout(leaveHover);
    };
    var createForm = function (response) {
        if (typeof(response) !== 'string') {
            response = '';
        }
        form = jq("<form id='{formId}' class='{formClassName}'>{response}</form>".supplant({formId: formId,
                                                                                            formClassName: options.formClassName,
                                                                                            response: response}));
        if (!response) {
            createEditField();
        } else {
            element.before(form);
            add_submit_button();
        }
    };
    var hasHTMLLineBreaks = function (string) {
        if (!options.handleLineBreaks) {
            return false;
        }
        return string.match(/<br/i) || string.match(/<p>/i);
    };
    var convertHTMLLineBreaks = function (string) {
        return string.replace(/<br>/gi, "\n").replace(/<br\/>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<p>/gi, "");
    };
    var createEditField = function () {
        if (options.value) {
            if (typeof options.value === "string") {
                value =  xmllib.unescape(options.value);
            }
        }
        element.before(form);
        if (options.get_values) {
            value = options.get_values;
        }
        if (!options.widget_name) {
            options.widget_name = options.widget_id;
        }
        if (options.loadTextURL) {
            value = "";
        }
        widget_ready = false;
        var widget_and_editField = widget.create(form, options.ui_type, options.label, options.widget_id, options.widget_name, options.ui_type, value, {'height': height, 'width': width});
        if (widget_and_editField) {
            js_widget = widget_and_editField[1];
            editField = widget_and_editField[0];
        }
        if (options.ui_type === 'text_wysiwyg' || options.ui_type === 'text_wysiwyg_small') {
            js_widget.on('editorContentLoaded', function () {
                widget_ready = true;
            });
        }
        if (options.loadTextURL) {
            loadExternalText();
        }
        var args = {widget_name: options.ui_type, object_type: options.object_type, object_id: options.object_id};
        args = jq.extend(args, options.template_args);
        if (!editField) {
            jq.get('/get_widget', args, setExternalWidget);
        } else {
            add_submit_button();
        }
    };
    var add_submit_button = function () {
        var submit_html = "";
        if (options.textarea) {
            submit_html = "<br />";
        }
        submit_html += "<div class='buttons'><input type='image' src='/static/images/button_save.gif' class='submit' value='{okText}'/><input type='image' src='/static/images/button_cancel.gif' class='cancel' value='{cancelText}' /></div><br class='clear' />".supplant({okText: options.okText, cancelText: options.cancelText});
        var dom_nodes = jq(submit_html);
        dom_nodes.appendTo(form);
        dom_nodes.find('.cancel').one('click', onclickCancel);
        dom_nodes.find('.submit').one('click', onSubmit);
    };
    var getText = function () {
        return element.html();
    };
    var setExternalWidget = function (data) {
        editField = jq('<div>{data}</div>'.supplant({data: data}));
        editField.appendTo(form);
        if (options.onEdit) {
            options.onEdit(element);
        }
        add_submit_button();
        jq(form.find('input')[0]).focus();
    };
    var loadExternalText = function () {
        form.addClass(options.loadingClassName);
        if (editField.get(0).tagName === 'INPUT') {
            editField.attr('disabled', 'true');
        }
        jq.get(options.loadTextURL, onLoadedExternalText);
    };
    var onLoadedExternalText = function (data) {
        var lock = false;
        function release_lock() {
           lock = false;
        }
        form.removeClass(options.loadingClassName);
        if (editField.get(0).tagName === 'INPUT') {
            editField.removeAttr('disabled');
        }
        if (options.ui_type === 'text_wysiwyg' || options.ui_type === 'text_wysiwyg_small') {
           if (widget_ready) {
               js_widget.setEditorHTML(data);
           } else {
               js_widget.on('editorContentLoaded', function () {
                   js_widget.setEditorHTML(data);
               });
           }
        } else if (options.ui_type === 'gmap') {
           form.before(js_widget[0].html(data));
           var geocoder = new GClientGeocoder();
           var set_address = function (address) {
                if (address.Status.code === 200) {
                    editField.val(address.Placemark[0].address);
                    //release the lock after 0.4 seconds
                }
                setTimeout(release_lock, 400);
           };
           var new_point = function (map, point) {
               if (lock === true) {
                   return false;
               }
               lock = true;
               geocoder.getLocations(point, function (address) {
                      set_address(address);
               });
	       return false;
	   };
           var editable_point = function (map, point) {
               map.setCenter(point, 15);
               map.addControl(new GLargeMapControl());
               var marker = new GMarker(point, {'draggable': true});
               map.addOverlay(marker);
               GEvent.addListener(marker, 'drag', function (point) {
                   new_point(map, point);
               });
               GEvent.addListener(marker, 'dragend', function (point) {
                   map.panTo(point);
               });
           };
           var marker = create_map(js_widget[0], editable_point);
           js_widget[0].after(js_widget[1]);
           editField.val(data);
        } else if (options.ui_type === 'text_large') {
            editField.val(data);
        } else if (options.ui_type === 'time_range_select') {
            var values = data.split('-');
            jq.each(editField.children(), function (i, ele) {
                jq(ele).val(values[i]);
                jq(ele).timepicker();
            });
        } else {
            editField.val(data.stripTags());
        }
        jq(editField.find('input')[0]).focus();

    };
    var onclickCancel = function () {
        if (oldInnerHTML) {
            element.html(oldInnerHTML);
            oldInnerHTML = "";
        }
        if (options.onCancel) {
            options.onCancel(element);
        }
        leaveEditMode();
        jq(window).scrollTop(elementTop);
        return false;
    };
    var onFailure = function (data) {
        options.onFailure(data);
        if (oldInnerHTML) {
            element.html(oldInnerHTML);
            oldInnerHTML = "";
        }
        return false;
    };
    var onComplete = function (data, xhr) {
	editField = null;
        if (xhr.status === 200 && xhr.getResponseHeader('X-Json') !== 'error') {
            if (options.ui_type === 'gmap') {
                element.html(data);
                leaveEditMode();
                create_map(element, plot_point);
            } else {
                element.show().html(data);
                oldInnerHTML = "";
                leaveEditMode();
                options.onComplete(data, element);
            }
        } else {
            leaveEditMode();
            createForm(data);
            enterEditMode(null, true);
        }
        if (options.dispose === true) {
            dispose();
        }

    };
    var onSubmit = function () {
        // onLoading resets these so we need to save them away for the Ajax call
        var value = "";
        if (options.ui_type === 'text_wysiwyg' || options.ui_type === 'text_wysiwyg_small') {
            js_widget.saveHTML();
            value = editField.val();
        } else {
            value = editField.val();
        }
        var parameters = options.callback(form, value);
        onLoading();
        var xhr = jq.ajax({type: 'post',
                           url: url,
                           data: parameters,
                           success: function (response) {
                               onComplete(response, xhr);
                           },
                           error: onFailure});
        options.value = value;
        jq(window).scrollTop(elementTop);
        return false;
    };
    var onLoading = function () {
        saving = true;
        removeForm();
        leaveHover();
        showSaving();
    };
    var showSaving = function () {
        if (!oldInnerHTML) {
            oldInnerHTML = element.html();
        }
        element.html(options.savingText).addClass(options.savingClassName).show();
    };
    var removeForm = function () {
        if (form) {
            form.remove();
            form = null;
        }
    };
    var enterHover = function () {
        if (saving) {
            return;
        }
        element.effect("highlight", {}, 4000);
    };
    var leaveHover = function () {
        if (saving) {
            return;
        }
    };
    var leaveEditMode = function () {
        removeForm();
	editField = null;
        leaveHover();
        element.removeClass(options.savingClassName).show();
        trigger.show();
        trigger.one(options.edit_event, enterEditMode);
        editing = false;
        saving = false;
        onLeaveEditMode();
    };
    var onEnterEditMode = function () {
        return;
    };
    var onLeaveEditMode = function () {
        if (options.ui_type === 'gmap') {
           js_widget[0].remove();
           js_widget[1].remove();
        }
    	return;
    };
    var dispose = function () {
        if (oldInnerHTML) {
            element.html(oldInnerHTML);
        }
        if (js_widget) {
           js_widget.destroy();
        }
        leaveEditMode();
        //stop event listeners?
    };
    init();
};

var set_inplace_edit = function (object_id, object_type, element_id, ui_type, save_func, load_func, template_args, onComplete, field_name, onEdit, onCancel) {
    if (!ui_type) {
        ui_type = jq('#' + element_id).attr('class') + "Edit";
    }
    if (!save_func) {
        save_func = '/save_' + ui_type;
    }
    var external_edit = element_id + "Edit";
    var test_external = jq('#' + external_edit);
    if (!test_external) {
        alert("can't find id " + external_edit);
    }
    var params = {
        callback: function (form, val) {
            return jq.merge(form.serializeArray(), [{name: 'id', value: object_id}, {name: 'value', value: encodeURIComponent(val)}]);
        },
        ajaxOptions: {method: 'post'},
        ui_type: ui_type,
        widget_id: element_id + '_widget',
        widget_name: field_name,
        label: element_id,
        property: element_id,
        value: jq('#' + element_id).html(),
        nav: navigation,
        loadTextURL: load_func,
        externalControl: external_edit,
        object_id: object_id,
        object_type: object_type,
        template_args: template_args,
        onEdit: onEdit,
        onCancel: onCancel
    };
    if (onComplete) {
        jq.extend(params, {onComplete: onComplete});
    }
    var editor = inplace_editor(element_id, save_func, params);
};
///////////////////////Image Upload//////////////////////////////
var Upload = function (id, type, attr, img, trigger, options) {
    if (!options) {
        options = {};
    } else {
	options = options;
    }
    if (!options.relative_url) {
        options.relative_url = '/';
    }
    var iframe = jq('<iframe></iframe>');
    var ie_refresh = null;
    var source_no = 0;
    var image_src = img.src;
    var parent_img = jq(img).parent();
    iframe.attr('name', 'upload-form' + attr + type + id);
    iframe.attr('id', 'upload-form' + attr + type + id);
    if (!options.height && !options.width) {
        options.height = jq(img).parent().height();
	options.width = jq(img).parent().width();
    }
    var hover = function () {
	jq(img).parent().effect("highlight", {}, 1000);
        jq(img).attr('title', options.title);
    };
    var unhover = function () {
    };
    var load_upload_iframe = function () {
	jq(img).css('display', 'none');
        var page_name = window.location.href.split('/');
        page_name = page_name[page_name.length-1].split('&');
        page_name = page_name[page_name.length-1];
        var src = options.relative_url + "uploadImageIframe/" + id + "/" + type + "/" + attr + '?page_name=' + page_name;
        if (options.height) {
            src += '&height=' + options.height;
	}
	if (options.width) {
	    src += '&width=' + options.width;
        }
        iframe.attr('src', src);
        var existing = jq('#' + iframe.attr('id'));
        if (!existing.length) {
            jq(img).parent().append(iframe);
        } else {
            iframe.css('display', 'inline');
        }
        iframe.load(cancel_or_submit);
        jq(trigger).unbind('mouseover').unbind('mouseout');
    };
    jq(trigger).one(options.edit_event, load_upload_iframe).mouseover(hover).mouseout(unhover);
    var submit_iframe = function () {
	iframe.one('load', refresh_image);
	iframe.css('display',  'none');
	jq(trigger).one(options.edit_event, load_upload_iframe).mouseover(hover).mouseout(unhover);
    };
    var cancel_or_submit = function () {
        unhover();
        iframe.contents().find('#cancel_iframe').click(cancel_iframe);
        iframe.contents().find('#submit_iframe').click(submit_iframe);
	iframe.contents().find('#auto_browse').one('change', function () {
	    overlib(jq('#throbber').html())	
	    iframe.contents().find('#submit_iframe').click();
	});
    };
    var cancel_iframe = function () {
        jq(img).css('display', 'inline');
	jq(trigger).one(options.edit_event, load_upload_iframe).mouseover(hover).mouseout(unhover);
        iframe.css('display',  'none');
    };
    var refresh_image = function () {
        source_no += 1;
        img.src = iframe.contents().find('#new_image_src').html() + '?no=' + source_no;
	nd();
	jq(img).load(function() {
	    jq(img).css('display', "inline");
	});
    };
};
