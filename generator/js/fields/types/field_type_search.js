function ui_field_type_search_init(field) {
    const button = field.el.closest('.input-group').querySelector('.search-clear-btn');
    if (button) {
        search_clear_button_init(button);
    }
}