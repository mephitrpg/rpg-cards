UI_FIELDS_CONFIGURATION_PREPARE.set('page', () => [
    {
        id: 'page-size',
        property: 'card_options.page_size',
        events: [
            ['change', function () {
                const { page_size, page_width, page_height } = card_options;
                const [w, h] = page_size ? page_size.split(',') : ['', ''];
                if (isLandscape(page_width, page_height)) {
                    getField('page-width').update(h);
                    getField('page-height').update(w);
                } else {
                    getField('page-width').update(w);
                    getField('page-height').update(h);
                }
                // The dimensions may just have been replaced by the selected
                // format, so read them again instead of using the old values.
                ui_set_orientation_info(
                    'page-orientation',
                    card_options.page_width,
                    card_options.page_height
                );
            }]
        ],
        init: () => {
            const { page_width, page_height } = card_options;
            ui_set_orientation_info('page-orientation', page_width, page_height);
        }
    },
    {
        id: 'page-width',
        property: 'card_options.page_width',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_set_value_to_format('page-size', page_width, page_height);
                ui_set_orientation_info('page-orientation', page_width, page_height);
            }]
        ]
    },
    {
        id: 'page-height',
        property: 'card_options.page_height',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_set_value_to_format(getField('page-size').el, page_width, page_height);
                ui_set_orientation_info('page-orientation', page_width, page_height);
            }]
        ]
    },
    {
        id: 'foreground-color',
        property: 'card_options.foreground_color',
        init: ui_field_type_color_init
    },
    {
        id: 'background-color',
        property: 'card_options.background_color',
        init: ui_field_type_color_init
    },
    {
        id: 'crop-marks',
        property: 'card_options.crop_marks'
    },
    {
        id: 'page-columns',
        property: 'card_options.page_columns',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'page-rows',
        property: 'card_options.page_rows',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'page-zoom-keep-ratio',
        property: 'app_settings.page_zoom_keep_ratio',
    },
    {
        id: 'page-zoom-width',
        property: 'card_options.page_zoom_width',
        events: [
            ['input', ui_zoom_update_correlates]
        ]
    },
    {
        id: 'page-zoom-height',
        property: 'card_options.page_zoom_height',
        events: [
            ['input', ui_zoom_update_correlates]
        ]
    },
    // Card settings
    {
        id: 'card-size',
        property: 'card_options.card_size',
        events: [
            ['change', function() {
                const value = this.value;
                const [w, h] = value ? value.split(',') : ['', ''];
                var width = '', height = '';
                var landscape = isLandscape(w, h);
                if (landscape) {
                    width = h;
                    height = w;
                } else {
                    width = w;
                    height = h;
                }
                getField('card-width').changeValue(width);
                getField('card-height').changeValue(height);
                if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                    getField('card-zoom-width').setValue(width);
                    getField('card-zoom-height').setValue(height);
                } else {
                    getField('card-zoom-width').trigger('input');
                }
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'card-width',
        property: 'card_options.card_width',
        events: [
            ['input', function() {
                const value = this.value;
                card_options['card_width'] = value;
                var width = card_options['card_width'];
                var height = card_options['card_height'];
                ui_set_value_to_format(document.getElementById('card-size'), width, height);
                ui_set_card_custom_size(width, height);
                ui_set_orientation_info('card-orientation', width, height);
                if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                    getField('card-zoom-width').update(width);
                    getField('card-zoom-height').update(height);
                } else {
                    getField('card-zoom-width').trigger('input');
                }
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'card-height',
        property: 'card_options.card_height',
        events: [
            ['input', function() {
                const value = this.value;
                card_options['card_height'] = value;
                var width = card_options['card_width'];
                var height = card_options['card_height'];
                ui_set_value_to_format(document.getElementById('card-size'), width, height);
                ui_set_card_custom_size(width, height);
                ui_set_orientation_info('card-orientation', width, height);
                if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                    getField('card-zoom-width').update(width);
                    getField('card-zoom-height').update(height);
                } else {
                    getField('card-zoom-height').trigger('input');
                }
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'card-arrangement',
        property: 'card_options.card_arrangement'
    },
    {
        id: 'card-zoom-width',
        property: 'card_options.card_zoom_width',
        events: [
            ['input', ui_zoom_update_correlates]
        ]
    },
    {
        id: 'card-zoom-height',
        property: 'card_options.card_zoom_height',
        events: [
            ['input', ui_render_selected_card]
        ]
    },
    {
        id: 'rounded-corners',
        property: 'card_options.rounded_corners',
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'back-bleed-width',
        property: 'card_options.back_bleed_width',
        events: [
            ['input', ui_render_selected_card]
        ]
    },
    {
        id: 'back-bleed-height',
        property: 'card_options.back_bleed_height',
        events: [
            ['input', ui_render_selected_card]
        ]
    }
]);
