UI_FIELDS_CONFIGURATION_PREPARE.set('default', () => [
    {
        id: 'default-color-front',
        property: 'card_options.default_color_front',
        init: ui_field_type_color_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-back-type',
        property: 'card_options.default_back_type',
        events: [
            ['change', function () {
                ui_update_back_type_controls(this.value);
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'default-color-back',
        property: 'card_options.default_color_back',
        init: ui_field_type_color_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-title-size',
        property: 'card_options.default_title_size',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-title-color',
        property: 'card_options.default_title_color',
        init: ui_field_type_color_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-icon-front',
        property: 'card_options.default_icon_front',
        init: ui_field_type_icon_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-icon-back',
        property: 'card_options.default_icon_back',
        init: ui_field_type_icon_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-icon-back-container',
        property: 'card_options.default_icon_back_container',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-icon-back-rotation',
        property: 'card_options.default_icon_back_rotation',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-card-font-size',
        property: 'card_options.default_card_font_size',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-auto-fit-font-size',
        property: 'card_options.default_auto_fit_font_size',
        valueGetter: value => typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value === 'Yes',
        valueSetter: value => value === 'Yes',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-card-background',
        property: 'card_options.default_background_image',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-card-background-size',
        property: 'card_options.default_background_size',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'small-icons',
        property: 'card_options.icon_inline',
        events: [
            ['change', ui_render_selected_card]
        ]
    },

    // $('#default-color-front-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#default-color-front").val(title);
    //         ui_set_default_color_front(value);
    //     }
    // });
    // $('#default-color-back-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#default-color-back").val(title);
    //         ui_set_default_color_back(value);
    //     }
    // });

    // function ui_set_default_color_front(color) {
    //     card_options.default_color_front = color;
    //     ui_render_selected_card();
    // }

    // function ui_set_default_color_back(color) {
    //     card_options.default_color_back = color;
    //     ui_render_selected_card();
    // }

    // function ui_change_default_color_front() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#default-color-front-selector");
    //     ui_set_default_color_front(color);
    // }


    // function ui_change_default_color_back() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#default-color-back-selector");
    //     ui_set_default_color_back(color);
    // }



]);
