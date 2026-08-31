UI_FIELDS_CONFIGURATION_PREPARE.set('file', () => [
    {
        id: 'file-name',
        property: 'app_settings.file_name',
        events: [
            ['focus', function(){this.select()}],
            ['blur', function(){if (!this.value) getField('el', this).reset()}]
        ]
    },
    {
        name: 'browser-asks-where-save',
        property: 'app_settings.browser_asks_where_save',
        valueGetter: Boolean,
        events: [
            ['change', () => {
                if (app_settings.browser_asks_where_save) getField('open-save-dialog').update(true);
            }]
        ]
    },
    {
        name: 'open-save-dialog',
        property: 'app_settings.open_save_dialog',
        valueGetter: Boolean,
        events: [
            ['change', () => {
                if (!app_settings.open_save_dialog) getField('browser-asks-where-save').update(false);
            }]
        ]
    }
]);
