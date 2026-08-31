function ui_field_type_icon_init(field) {
    field.$el.typeahead({
        source: icon_names,
        items: 'all',
        render: ui_field_type_icon_typeahead_render,
        afterSelect: function() {
            // Trigger only change, not input.
            // This updates card preview without reopening the typeahead dropdown.
            field.trigger('change');
        }
    });
    const searchButton = field.el.closest('.input-group').querySelector('.icon-select-button');
    searchButton.addEventListener('click', ui_field_type_icon_search);
}

function ui_field_type_icon_typeahead_render(items) {
    var that = this;
    items = $(items).map(function (i, item) {
        i = $(that.options.item).data('value', item);
        i.find('a').html(that.highlighter(item));
        var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
        i.find('a').append('<span class="' + classname + '"></span>');
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