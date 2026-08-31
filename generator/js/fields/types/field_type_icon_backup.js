function ui_field_type_icon_init(field) {
    field.$el.typeahead({
        source: icon_names,
        items: 'all',
        render: ui_field_type_icon_typeahead_render,
        minLength: 1,
        delay: 50,
        updater: function(item) {
            field.el.value = item;
            field.el.dispatchEvent(new Event('change'));
            return item;
        }
    });
    field.el.closest('.input-group').querySelector('.icon-select-button').addEventListener('click', ui_field_type_icon_search);
}

function ui_field_type_icon_typeahead_render(items) {
    var that = this;

    items = $(items).map(function (i, item) {
        i = $(that.options.item).data('value', item);
        i.find('a').html(that.highlighter(item));
        
        // Aggiungi icona semplice
        var iconPath = 'icons/' + item + '.svg';
        var img = '<img src="' + iconPath + '" style="width: 16px; height: 16px; margin-right: 8px;" onerror="this.style.display=\'none\'" />';
        i.find('a').prepend(img);
        
        return i[0];
    });

    if (this.autoSelect) {
        items.first().addClass('active');
    }

    this.$menu.html(items);
    return this;
}

function ui_field_type_icon_search() {
    window.open("http://game-icons.net/", "_blank");
}
