UI_FIELDS_CONFIGURATION_PREPARE.set('card', () => [
    // Name
    {
        id: 'card-title',
        property: [ui_selected_card, 'title'],
        defaultProperty: [default_card_data, 'title'],
        initWithDefaultValue: false,
        eventListeners: {
            changeHandler: function (event) {
                ui_render_selected_card();
                const card = ui_selected_card();
                const displayTitleField = getField('card-title-display');
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    displayTitleField.el.placeholder = event.target.value;
                } else {
                    displayTitleField.el.placeholder = displayTitleField.el.getAttribute('data-placeholder');
                }
            }
        },
        events: [
            ['input', 'changeHandler'],
            ['change', 'changeHandler']
        ]
    },
    // Count
    {
        id: 'card-count',
        property: [ui_selected_card, 'count'],
        defaultProperty: 'card_options.card_count',
        initWithDefaultValue: false,
        eventListeners: {
            changeHandler: function () {
                var card = ui_selected_card();
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    ui_update_deck_total_count();
                }
            }
        },
        events: [
            ['input', 'changeHandler']
        ]
    },
    // Tags
    // ----------
    // Front color
    {
        id: 'card-color-front',
        property: [ui_selected_card, 'color_front'],
        defaultProperty: 'card_options.default_color_front',
        initWithDefaultValue: false,
        init: ui_field_type_color_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Header
    {
        id: 'header-show',
        property: [ui_selected_card, 'header_show'],
        initWithDefaultValue: false,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Title
    {
        id: 'card-title-display',
        property: [ui_selected_card, 'title_display'],
        // defaultProperty: 'card_options.title', // none!
        initWithDefaultValue: false,
        init: ui_field_type_search_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Title size
    {
        id: 'card-title-size',
        property: [ui_selected_card, 'title_size'],
        defaultProperty: 'card_options.default_title_size',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Title color
    {
        id: 'card-title-color',
        property: [ui_selected_card, 'title_color'],
        defaultProperty: 'card_options.default_title_color',
        initWithDefaultValue: false,
        init: ui_field_type_color_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Card type
    {
        id: 'card-type',
        property: [ui_selected_card, 'card_type'],
        defaultProperty: 'card_options.card_type',
        initWithDefaultValue: false,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Front icons
    // Front icons color
    {
        id: 'card-icon-front-color',
        property: [ui_selected_card, 'icon_front_color'],
        // defaultProperty: 'card_options.icon_front_color', // none!
        initWithDefaultValue: false,
        init: ui_field_type_color_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // ----------
    // Back color
    {
        id: 'card-color-back',
        property: [ui_selected_card, 'color_back'],
        defaultProperty: 'card_options.default_color_back',
        initWithDefaultValue: false,
        init: ui_field_type_color_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Back icon
    // Back icon rotation
    // Back icon container
    // Back image
    // ----------
    // Content front or back
    // Content front
    // Content back
    // Text size
    // Relative to
    {
        id: 'vertical-alignment-reference',
        property: [ui_selected_card, 'vertical_alignment_reference'],
        defaultProperty: 'card_options.vertical_alignment_reference',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Card font size
    {
        id: 'card-font-size',
        property: [ui_selected_card, 'card_font_size'],
        defaultProperty: 'card_options.default_card_font_size',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Card icons
    {
        id: 'card-icon-front',
        property: [ui_selected_card, 'icon_front'],
        defaultProperty: 'card_options.default_icon_front',
        initWithDefaultValue: false,
        init: ui_field_type_icon_init,
        autoDebounce: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-icon-back',
        property: [ui_selected_card, 'icon_back'],
        defaultProperty: 'card_options.default_icon_back',
        initWithDefaultValue: false,
        init: ui_field_type_icon_init,
        autoDebounce: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-icon-back-container',
        property: [ui_selected_card, 'icon_back_container'],
        defaultProperty: 'card_options.default_icon_back_container',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-icon-back-rotation',
        property: [ui_selected_card, 'icon_back_rotation'],
        defaultProperty: 'card_options.default_icon_back_rotation',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Card background
    {
        id: 'card-background',
        property: [ui_selected_card, 'background_image'],
        defaultProperty: 'card_options.default_background_image',
        initWithDefaultValue: false,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Card contents
    {
        id: 'card-contents',
        property: [ui_selected_card, 'contents'],
        defaultProperty: 'card_options.contents',
        initWithDefaultValue: false,
        valueGetter: (value) => {
            if (value == null || value === undefined) return "";
            return Array.isArray(value) ? value.join("\n") : (value || "");
        },
        valueSetter: (value) => typeof value === 'string' ? value.split("\n") : value,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Card tags
    {
        id: 'card-tags',
        property: [ui_selected_card, 'tags'],
        defaultProperty: [default_card_data, 'tags'],
        initWithDefaultValue: false,
        valueGetter: (value) => {
            if (value == null || value === undefined) return "";
            return Array.isArray(value) ? value.join(", ") : (value || "");
        },
        valueSetter: (value) => {
            if (typeof value === 'string') {
                const trimmed = value.trim();
                return trimmed.length === 0 ? [] : trimmed.split(',').map(t => t.trim());
            }
            return value;
        },
        events: [
            ['change', ui_render_selected_card]
        ]
    },


    // $("#card-color-front").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-front-selector");
    //     ui_set_card_color_front(color);
    // });
    // $("#card-color-back").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-back-selector");
    //     ui_set_card_color_back(color);
    // });


// function ui_set_card_color_front(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }
// function ui_set_card_color_back(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }


    //     $('#card-color-front-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-front").val(title);
    //         ui_set_card_color_front(value);
    //     }
    // });
    // $('#card-color-back-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-back").val(title);
    //         ui_set_card_color_back(value);
    //     }
    // });



]);