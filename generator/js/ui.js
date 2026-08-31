// Ugly global variable holding the current card deck
var card_data = [];
var card_options = default_card_options();
var app_settings = default_app_settings();

function default_app_settings() {
    return {
        file_name: 'rpg_cards',
        browser_asks_where_save: false,
        open_save_dialog: false,
        show_download_settings: true,
        page_zoom_keep_ratio: true
    }
}

function mergeSort(arr, compare) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge(left, right, compare) {
    var result = [];

    while (left.length && right.length) {
        if (compare(left[0], right[0]) <= 0) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function swapInputValues(id1, id2) {
    const field1 = getField(id1);
    const field2 = getField(id2);
    if (field1 && field2) {
        const v1 = field1.getData();
        const v2 = field2.getData();
        field1.changeValue(v2);
        field2.changeValue(v1);
    } else {
        const e1 = document.getElementById(id1);
        const e2 = document.getElementById(id2);
        const v1 = e1.value;
        const v2 = e2.value;
        e1.value = v2;
        e1.dispatchEvent(new Event('input'));
        e2.value = v1;
        e2.dispatchEvent(new Event('input'));
    }
}

function ui_generate() {
    if (card_data.length === 0) {
        alert("Your deck is empty. Please define some cards first, or load the sample deck.");
        return;
    }

    // Keep one immutable set of page options for the generated document. This
    // prevents a change in the sidebar during the popup delay from making crop
    // marks or page metadata disagree with the generated card layout.
    var outputOptions = { ...card_options };

    // Generate output HTML
    var { style, html, pages } = card_pages_generate_html(card_data, outputOptions);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    if (!tab || tab.closed || typeof tab.closed === 'undefined') {
        alert(`It looks like your browser blocked the popup window. Please allow popups for this site to continue.`);
        return;
    }

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () {
        // A literal "null" is not a valid targetOrigin for postMessage. The
        // fallback only applies when the app is opened directly from disk; the
        // receiver still verifies that this window is its opener.
        const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin;
        tab.postMessage({ style, html, pages, options: outputOptions }, targetOrigin);
    }, 500);
}

function ui_load_sample() {
    // card_data = card_data_example;
    // ui_init_cards(card_data);
    // ui_update_card_list();
    const firstAddedCardIndex = card_data.length;
    ui_add_cards(card_data_example);
    ui_select_card_by_index(firstAddedCardIndex);
}

function ui_clear_all(enableAsking) {
    if (!card_data.length) {
        return true;
    }
    const proceed = enableAsking && document.getElementById('ask-before-delete').checked ? confirm('This will delete all cards and set the default file name.\n\nContinue?') : true;
    if (proceed) {
        card_data = [];
        ui_update_card_list();
        getField('file-name').reset();
    }
    return proceed;
}

async function ui_load_files(evt) {
    const target = evt.target;
    const files = Array.from(target.files || []);
    const isOpening = Boolean(evt.target.getAttribute('data-opening'));
    const clearAll = Boolean(evt.target.getAttribute('data-clear-all'));
    const firstAddedCardIndex = card_data.length;

    // Reset file input
    $("#file-load-form")[0].reset();

    const readFile = file => new Promise(resolve => {
        const reader = new FileReader();

        reader.onload = function () {
            const result = (this.result || '').trim();
            if (!result) {
                showToast(`The file ${file.name} is empty.`);
                resolve(null);
                return;
            }

            try {
                resolve({ file, cards: legacy_card_data(JSON.parse(result)) });
            } catch (err) {
                console.error(`Error parsing ${file.name}:`, err);
                showToast(`Error parsing ${file.name}:`, 'danger');
                resolve(null);
            }
        };

        reader.onerror = function () {
            console.error(`Error reading ${file.name}:`, this.error);
            showToast(`Error reading ${file.name}:`, 'danger');
            resolve(null);
        };

        reader.readAsText(file);
    });

    // Promise.all preserves the user's file-selection order even when the
    // individual FileReader operations finish in a different order.
    const loadedFiles = (await Promise.all(files.map(readFile))).filter(Boolean);
    if (!loadedFiles.length) return;

    if (isOpening && clearAll) {
        ui_clear_all(false);
    }

    ui_add_cards(loadedFiles.flatMap(({ cards }) => cards));

    if (isOpening) {
        const firstFileName = loadedFiles[0].file.name.replace(/\.[^/.]+$/, '');
        getField('file-name').changeValue(firstFileName);
    } else {
        ui_select_card_by_index(firstAddedCardIndex);
    }
}

function ui_init_cards(data) {
    return legacy_card_data(data);
}

function ui_generate_uuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').replace(
            /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
            '$1-$2-$3-$4-$5'
        );
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
        const random = Math.random() * 16 | 0;
        const value = character === 'x' ? random : (random & 0x3 | 0x8);
        return value.toString(16);
    });
}

function ui_add_cards(data) {
    const newData = ui_init_cards(data);
    card_data = card_data.concat(newData);
    ui_update_card_list();
    ui_select_card_by_index(0);
    $("#collapseDeck").collapse('toggle');
}

function ui_add_new_card() {
    card_data.push(legacy_card_data([{
        ...default_card_data(),
        title: 'New card'
    }])[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_duplicate_card() {
    var old_card = ui_selected_card();
    if (old_card && card_data.length > 0) {
        var new_card = $.extend({}, old_card);
        card_data.push(new_card);
        new_card.title = new_card.title + " (Copy)";
        new_card.uuid = ui_generate_uuid();
    } else {
        card_data.push({
        ...default_card_data(),
        uuid: ui_generate_uuid()
    });
    }
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_copy_card() {
    const card = ui_selected_card();
    if (card && card_data.length > 0) {
        navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(function() {
            showToast('Card "' + card.title + '" was copied to the clipboard');
        }, function() {
            showToast('Failure to copy: Check permissions for clipboard or try with another browser');
        });
    }
}

function ui_copy_all_cards() {
    navigator.clipboard.writeText(JSON.stringify(card_data, null, 2)).then(function() {
        showToast('All cards were copied to the clipboard');
    }, function() {
        showToast('Failure to copy: Check permissions for clipboard or try with another browser');
    });
}

function ui_paste_card() {
    navigator.clipboard.readText().then(function(s) {
        try {
            const prev_data_length = card_data.length;
            const pasted_content = JSON.parse(s);
            const content = Array.isArray(pasted_content) ? pasted_content : [pasted_content];
            content.forEach(c => {
                c.uuid = ui_generate_uuid();
                c.title += " (Pasted)";
                card_data.push(c);
            });
            ui_update_card_list();
            ui_select_card_by_index(prev_data_length);
        } catch (e) {
            alert('Could not paste clipboard as card or list of cards.\n' + e);
        }
    }, function() {
        alert('Failure to paste: Check permissions for clipboard or try with another browser')
    })
}

function ui_select_card_by_index(index) {
    $(`#deck-cards-list .radio:nth-child(${index + 1}) input[type="radio"]`).prop('checked', true);
    ui_update_selected_card();
}

function ui_selected_card_index() {
    const $checkedInput = $('#deck-cards-list input[type="radio"]:checked');
    if (!$checkedInput) return -1;
    return $checkedInput.closest('.radio').index();
}

function ui_selected_card() {
    return card_data[ui_selected_card_index()];
}

function ui_delete_card() {
    var index = ui_selected_card_index();
    if (index === -1) return;
    const proceed = document.getElementById('ask-before-delete').checked ? confirm('Delete ' + card_data[index].title + '?') : true;
    if (!proceed) return;
    card_data.splice(index, 1);
    ui_update_card_list();
    ui_select_card_by_index(Math.min(index, card_data.length - 1));
}

const ui_deck_option_text = (card) => {
    return `${card.count}x ${card.title}`;
}

const ui_update_deck_total_count = () => {
    $("#total-card-count").text(`Contains ${card_data.length} unique cards, ${card_data.reduce((result, card) => {
        return result + (card?.count || 1) * 1;
    }, 0)} in total.`);
}

function ui_update_card_list() {

    const $deck = $('#deck-cards-list');

    $deck.children().each(function() {
        const option = this;
        if (!card_data.find(card => card.uuid === option.getAttribute('data-uuid'))) option.remove();
    });

    let i = card_data.length;

    while (i--) {
        var card = card_data[i];
        const cardUuid = String(card.uuid);
        const $option = $deck.children().filter(function () {
            return this.getAttribute('data-uuid') === cardUuid;
        });
        if (!$option.length) {
            const $input = $('<input>', {
                type: 'radio',
                name: 'deck-option',
                value: i
            });
            const $text = $('<span>', { class: 'text' }).text(ui_deck_option_text(card));
            const $label = $('<label>').append($input, document.createTextNode(' '), $text);
            const $newOption = $('<div>', { class: 'radio' })
                .attr('data-uuid', cardUuid)
                .append($label);
            $deck.prepend($newOption);
        } else if ($option.index() === i) {
            $option.find('.text').text(ui_deck_option_text(card));
        } else {
            $option.find('.text').text(ui_deck_option_text(card));
            $deck.prepend($option.detach());
        }
    }

    ui_update_deck_total_count();
    ui_update_selected_card();
}

async function ui_save_file() {
    const data = card_data.map(item => {
        const card = { ...item };
        delete card.uuid;
        return card;
    });
    const jsonString = JSON.stringify(data, null, "  ");
    let filename = app_settings.file_name;
    
    if (window.showSaveFilePicker) {
        if (app_settings.open_save_dialog) {
            if (!app_settings.browser_asks_where_save) {
                try {
                    const options = {
                        suggestedName: filename + '.json',
                        types: [{
                        description: 'File JSON',
                        accept: { 'application/json': ['.json'] }
                        }]
                    };

                    const handle = await showSaveFilePicker(options);
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    const newFilename = handle.name.split('.').slice(0, -1).join('.');
                    if (newFilename !== filename) getField('file-name').changeValue(newFilename);
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.error(err);
                }
            }
        }
    }

    const parts = [jsonString];
    const blob = new Blob(parts, { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = $("#file-save-link")[0];
    a.href = url;
    if (filename) {
        a.download = filename 
        ui_save_file_filename = filename;
        a.click();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function ui_update_selected_card() {
    var card = ui_selected_card();
    if (card) {
        // Use Field class for ALL card fields (contents/tags now have valueGetter/valueSetter)
        // Update the inputs without firing events to avoid opening typeahead dropdowns.
        getFieldGroup('card').forEach(field => {
            field.update(field.getData());
        });
    } else {
        getFieldGroup('card').forEach(field => {
            field.reset();
        });
    }

    ui_render_selected_card();
    ui_update_card_actions();
}

function ui_filter_selected_card_title() {
    const filterInput = document.querySelector('#deck-cards-list-title-filter');
    if (!filterInput) return;

    const filterValue = filterInput.value.trim().toLowerCase();
    document.querySelectorAll('#deck-cards-list .radio').forEach(option => {
        const labelText = option.textContent.toLowerCase();
        option.style.display = filterValue && !labelText.includes(filterValue) ? 'none' : '';
    });
}

function search_clear_button_init(button) {
    if (!button) return;
    const wrapper = button.closest('.input-group-btn');
    const container = button.closest('.input-group');
    if (!wrapper || !container) return;

    wrapper.style.display = 'none';
    button.style.cursor = 'default';
    button.innerHTML = '&times;';

    container.style.width = '100%';
    const input = container.querySelector('input[type="search"]');
    if (!input) return;

    const updateButtonVisibility = () => {
        wrapper.style.display = input.value ? '' : 'none';
    };

    input.addEventListener('input', () => {
        updateButtonVisibility();
    });

    button.addEventListener('click', () => {
        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        ui_filter_selected_card_title();
    });

    updateButtonVisibility();
}

// function ui_filter_selected_card_title_clear() {
//     $('#deck-cards-list-title-filter').focus().val('');
//     ui_filter_selected_card_title();
// }

function ui_update_card_actions() {
    var action_groups = {};

    // Group actions by category
    for (var function_name in card_action_info) {
        var info = card_action_info[function_name];
        if (!action_groups[info.category]) {
            action_groups[info.category] = [];
        }
        action_groups[info.category].push(function_name);
    }

    var parent = $('#card-actions');
    parent.empty();

    for (var group_name in action_groups) {
        var group_div = $('<div class="action-group"></div>');
        group_div.append($('<h4>' + group_name + '</h4>'));
        var actions = action_groups[group_name];
        for (var i = 0; i < actions.length; ++i) {
            var function_name = actions[i];
            var info = card_action_info[function_name];
            var action_name = info.example.split(" ")[0];

            var button = $('<button type="button" class="btn btn-default btn-sm action-button">' + action_name + '</button>');
            button.attr('title', info.summary);
            button.attr('data-function-name', function_name);
            button.click(function () {
                var contents = $('#card-contents');
                var contentsTextarea = contents[0];
                var function_name = $(this).attr('data-function-name');
                var info = card_action_info[function_name] || {
                    summary: 'Missing summary',
                    example: action_name
                };
                insertTextAtCursor(contentsTextarea, info.example);
                contents.trigger("change");
            });
            group_div.append(button);
        }
        parent.append(group_div);
    }
}

function ui_render_selected_card() {
    const card = ui_selected_card();
    $('#preview-container').empty();
    if (card) {
        const front = card_generate_front(card, card_options, { isPreview: true });
        const back = card_generate_back(card, card_options, { isPreview: true });
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = DOMPurify.sanitize(front + "\n" + back);
        process_card_generated_front(previewContainer);
    }
    local_store_save();
}

function ui_open_help() {
    $("#help-modal").modal('show');
}

function ui_zoom_update_correlates(event) {
    const field = getField(event.target.id);
    const property = field.key;
    const value = field.getValue();
    const cardWidth = card_options['card_width'];
    const cardHeight = card_options['card_height'];
    const r = math_eval(`${cardWidth} / ${cardHeight}`);
    if (r) {
        const setVal = (k, v, property) => {
            if (k === property) {
                card_options[k] = value;
            } else {
                const val = math_format(v);
                card_options[k] = val;
                $(`#${k.replace(/_/g, '-')}`).val(val);
            }
        }
        let percWidth;
        let percHeight;
        let sizeWidth;
        let sizeHeight;
        const keepRatio = app_settings.page_zoom_keep_ratio;
        if (property === 'page_zoom_width') {
            percWidth = value;
            percHeight = keepRatio ? percWidth : card_options['page_zoom_height'];
        } else if (property === 'page_zoom_height') {
            percHeight = value;
            percWidth = keepRatio ? percHeight : card_options['page_zoom_width'];
        } else if (property === 'card_zoom_width') {
            sizeWidth = value;
            sizeHeight = keepRatio ? math_eval(`${sizeWidth} / ${r}`) : card_options['card_zoom_height'];
        } else if (property === 'card_zoom_height') {
            sizeHeight = value;
            sizeWidth = keepRatio ? math_eval(`${sizeHeight} * ${r}`) : card_options['card_zoom_width'];
        }
        if (isNil(percWidth)) {
            percWidth = math_eval(`${sizeWidth} / ${cardWidth} * 100`);
            percHeight = math_eval(`${sizeHeight} / ${cardHeight} * 100`);
        } else {
            sizeWidth = math_eval(`${cardWidth} * ${percWidth} / 100`);
            sizeHeight = math_eval(`${cardHeight} * ${percHeight} / 100`);
        }
        setVal('page_zoom_width', percWidth, property);
        setVal('page_zoom_height', percHeight, property);
        setVal('card_zoom_width', sizeWidth, property);
        setVal('card_zoom_height', sizeHeight, property);
        ui_render_selected_card();
    }
}

function ui_change_option() {
    var property = $(this).attr("data-option");
    var value;
    if ($(this).attr('type') === 'checkbox') {
        value = $(this).is(':checked');
    } else {
        value = $(this).val();
    }
    switch (property) {
        // case 'card_size': {
        //     const changed = card_options[property] !== value;
        //     let w, h;
        //     if (changed) {
        //         card_options[property] = value;
        //         [w, h] = value ? value.split(',') : ['', ''];
        //     } else {
        //         w = card_options['card_width'];
        //         h = card_options['card_height'];
        //     }
        //     var width = '', height = '';
        //     var landscape = isLandscape(w, h);
        //     if (landscape) {
        //         width = h;  height = w;
        //     } else {
        //         width = w;  height = h;
        //     }
        //     card_options['card_width'] = width;
        //     card_options['card_height'] = height;
        //     $('#card-width').val(width).trigger("input");
        //     $('#card-height').val(height).trigger("input");
        //     if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
        //         $('#card-zoom-width').val(width);
        //         $('#card-zoom-height').val(height);
        //     } else {
        //         $('#card-zoom-width').trigger('input');
        //     }
        //     break;
        // }
        // case 'card_width':
        // case 'card_height': {
        //     card_options[property] = value;
        //     var width = card_options['card_width'];
        //     var height = card_options['card_height'];
        //     ui_set_value_to_format(document.getElementById('card-size'), width, height);
        //     ui_set_card_custom_size(width, height);
        //     ui_set_orientation_info('card-orientation', width, height);
        //     if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
        //         $('#card-zoom-width').val(width);
        //         $('#card-zoom-height').val(height);
        //     } else {
        //         $('#card-zoom-width').trigger('input');
        //     }
        //     break;
        // }
        // case 'page_zoom_width':
        // case 'page_zoom_height':
        // case 'card_zoom_width':
        // case 'card_zoom_height': {
        //     const setVal = (k, v, property) => {
        //         if (k === property) {
        //             card_options[k] = value;
        //         } else {
        //             const val = math_format(v);
        //             card_options[k] = val;
        //             $(`#${k.replace(/_/g, '-')}`).val(val);
        //         }
        //     }
        //     const cardWidth = card_options['card_width'];
        //     const cardHeight = card_options['card_height'];
        //     const r = math_eval(`${cardWidth} / ${cardHeight}`);
        //     if (r) {
        //         let percWidth;
        //         let percHeight;
        //         let sizeWidth;
        //         let sizeHeight;
        //         const keepRatio = app_settings.page_zoom_keep_ratio;
        //         if (property === 'page_zoom_width') {
        //             percWidth = value;
        //             percHeight = keepRatio ? percWidth : card_options['page_zoom_height'];
        //         } else if (property === 'page_zoom_height') {
        //             percHeight = value;
        //             percWidth = keepRatio ? percHeight : card_options['page_zoom_width'];
        //         } else if (property === 'card_zoom_width') {
        //             sizeWidth = value;
        //             sizeHeight = keepRatio ? math_eval(`${sizeWidth} / ${r}`) : card_options['card_zoom_height'];
        //         } else if (property === 'card_zoom_height') {
        //             sizeHeight = value;
        //             sizeWidth = keepRatio ? math_eval(`${sizeHeight} * ${r}`) : card_options['card_zoom_width'];
        //         }
        //         if (isNil(percWidth)) {
        //             percWidth = math_eval(`${sizeWidth} / ${cardWidth} * 100`);
        //             percHeight = math_eval(`${sizeHeight} / ${cardHeight} * 100`);
        //         } else {
        //             sizeWidth = math_eval(`${cardWidth} * ${percWidth} / 100`);
        //             sizeHeight = math_eval(`${cardHeight} * ${percHeight} / 100`);
        //         }
        //         setVal('page_zoom_width', percWidth, property);
        //         setVal('page_zoom_height', percHeight, property);
        //         setVal('card_zoom_width', sizeWidth, property);
        //         setVal('card_zoom_height', sizeHeight, property);
        //     }
        //     break;
        // }
        default: {
            card_options[property] = value;
            break;
        }
    }
    ui_render_selected_card();
}

function ui_set_value_to_format(selectorId, width, height) {
    var selector = typeof selectorId === 'string' ? document.getElementById(selectorId) : selectorId;
    var len = selector.options.length;
    var portrait = "", landscape = "", format = "", o = null;
    for(var i = 0; i < len; i++) {
        o = selector.options[i];
        portrait = [width, height].join(',');
        if (o.value === portrait) { format = portrait; break; }
        landscape = [height, width].join(',');
        if (o.value === landscape) { format = landscape; break; }
    }
    selector.value = format;
}

function ui_set_orientation_info(elementId, cssWidth, cssHeight) {
    var orientation = getOrientation(cssWidth, cssHeight);
    document.getElementById(elementId).textContent = orientation;
    return orientation;
}

function ui_move_top() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.unshift(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(0);
}

function ui_move_bottom() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.push(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_move_up() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx > 0) {
        [card_data[idx], card_data[idx - 1]] = [card_data[idx - 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx - 1);
    }
}

function ui_move_down() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx < card_data.length - 1) {
        [card_data[idx], card_data[idx + 1]] = [card_data[idx + 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx + 1);
    }
}

// function ui_change_card_property() {
//     var property = $(this).attr("data-property");
//     var value = $(this).val();
//     var card = ui_selected_card();
//     if (card) {
//         card[property] = value;
//         ui_render_selected_card();
//     }
// }

function ui_set_card_custom_size(width, height) {
    var card = ui_selected_card();
    if (card) {
        card.card_width = width;
        card.card_height = height;
        ui_render_selected_card();
    }
}

// function ui_change_default_icon_back() {
//     var value = $(this).val();
//     card_options.default_icon_back = value;
//     ui_render_selected_card();
// }

// function ui_change_default_icon_back_rotation() {
//     var value = $(this).val();
//     card_options.default_icon_back_rotation = value;
//     ui_render_selected_card();
// }

// function ui_change_default_icon_back_container() {
//     var value = $(this).val();
//     card_options.default_icon_back_container = value;
//     ui_render_selected_card();
// }

// function ui_change_card_contents() {
//     var html = $(this).val();
//     var card = ui_selected_card();
//     if (card) {
//         card.contents = html.split("\n");
//         ui_render_selected_card();
//     }
// }

// function ui_change_card_contents_keyup () {
//     clearTimeout(ui_change_card_contents_keyup.timeout);
//     ui_change_card_contents_keyup.timeout = setTimeout(function () {
//         $('#card-contents').trigger('change');
//     }, 200);
// }
// ui_change_card_contents_keyup.timeout = null;

function ui_change_card_tags() {
    var value = $(this).val();

    var card = ui_selected_card();
    if (card) {
        if (value.trim().length === 0) {
            card.tags = [];
        } else {
            card.tags = value.split(",").map(function (val) {
                return val.trim().toLowerCase();
            });
        }
        ui_render_selected_card();
    }
}

// function ui_change_default_title_size() {
//     card_options.default_title_size = $(this).val();
//     ui_render_selected_card();
// }

// function ui_change_default_icon_size() {
//     card_options.icon_inline = $(this).is(':checked');
//     ui_render_selected_card();
// }

// function ui_change_default_card_font_size() {
//     card_options.default_card_font_size = $(this).val();
//     ui_render_selected_card();
// }

// function ui_change_default_card_background() {
//     card_options.default_background_image = $(this).val();
//     ui_render_selected_card();
// }

function ui_sort() {
    $("#sort-modal").modal('show');
}

function ui_sort_execute() {
    $("#sort-modal").modal('hide');

    var fn_code = $("#sort-function").val();
    var fn = new Function("card_a", "card_b", fn_code);

    card_data = card_data.sort(function (card_a, card_b) {
        var result = fn(card_a, card_b);
        return result;
    });

    ui_update_card_list();
}

function ui_filter() {
    $("#filter-modal").modal('show');
}

function ui_filter_execute() {
    $("#filter-modal").modal('hide');

    var fn_code = $("#filter-function").val();
    var fn = new Function("card", fn_code);

    card_data = card_data.filter(function (card) {
        var result = fn(card);
        if (result === undefined) return true;
        else return result;
    });

    ui_update_card_list();
}

function ui_apply_card_default(identifier) {
    const field = getField(identifier);
    const k = field.key;
    const v = field.getDefaultValue();
    card_data.forEach(card => { card[k] = v; });
    local_store_save();
    if (ui_selected_card()) {
        field.reset();
        ui_update_selected_card();
    }
}

// function card_apply_color_front() {
//     const k = 'color_front';
//     const v = card_options.default_color_front;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_color_back() {
//     const k = 'color_back';
//     const v = card_options.default_color_back;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_font_title() {
//     const k = 'title_size';
//     const v = card_options.default_title_size;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_title_color() {
//     const k = 'title_color';
//     const v = card_options.default_title_color;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_font_card() {
//     const k = 'card_font_size';
//     const v = card_options.default_card_font_size;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_icon_front() {
//     const k = 'icon_front';
//     const v = card_options.default_icon_front;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_icon_back() {
//     const k = 'icon_back';
//     const v = card_options.default_icon_back;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_icon_back_container() {
//     const k = 'icon_back_container';
//     const v = card_options.default_icon_back_container;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_icon_back_rotation() {
//     const k = 'icon_back_rotation';
//     const v = card_options.default_icon_back_rotation;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

// function ui_apply_default_card_background() {
//     const k = 'background_image';
//     const v = card_options.default_background_image;
//     card_data.forEach(card => { card[k] = v; }); 
//     ui_update_selected_card();
// }

//Adding support for local store
function local_store_save () {
    function save() {
       if(window.localStorage){
            const card_data_to_save = card_data.map(c => {
                const card = { ...c };
                delete card.uuid;
                return card;
            });
            try {
                localStorage.setItem('card_data', JSON.stringify(card_data_to_save));
                localStorage.setItem('card_options', JSON.stringify(card_options));
                localStorage.setItem('app_settings', JSON.stringify(app_settings));
            } catch (e){
                //if the local store save failed should we notify the user that the data is not being saved?
                console.log(e);
            }
        }
    }
    // Replace this function with its debounced version
    local_store_save = debounce(save, 250);
    // Call it immediately with the first invocation’s arguments
    return local_store_save.apply(this, arguments);
}

function legacy_card_data(oldData = []) {
    const newData = oldData?.map(oldCard => {
        const card = card_init({ ...oldCard });
        if (!isNil(card.icon)) {
            card.icon_front = card.icon;
            delete card.icon;
        }
        if (!isNil(card.color)) {
            card.color_front = card.color;
            card.color_back = '';
            delete card.color;
        }
        if (isNil(card.uuid)) {
            card.uuid = ui_generate_uuid();
        }
        return card;
    });
    return newData;
}

function legacy_card_options(data = {}) {
    const newData = {
        ...default_card_options(),
        ...data
    };
    if (!isNil(newData.page_zoom)) {
        newData.page_zoom_width = newData.page_zoom;
        newData.page_zoom_height = newData.page_zoom;
        delete newData.page_zoom;
    }
    return newData;
}

function legacy_app_settings(data = {}) {
    return {
        ...default_app_settings(),
        ...data
    };
}

function local_store_load() {
    if(window.localStorage){
        try {
            const storedCards = JSON.parse(localStorage.getItem("card_data"));
            if (storedCards) {
                card_data = legacy_card_data(storedCards)
            }
            const storedOptions = JSON.parse(localStorage.getItem("card_options"));
            if (storedOptions) {
                card_options = legacy_card_options(storedOptions);
            }
            const storedSettings = JSON.parse(localStorage.getItem("app_settings"));
            if (storedSettings) {
                app_settings = legacy_app_settings(storedSettings);
            }
        } catch (e){
            //if the local store load failed should we notify the user that the data load failed?
            showToast('Error loading from localStorage', 'danger')
            console.error(e);

        }
    }
}

function showToast(message, type = 'info', duration = 5000) {
  const allowedTypes = new Set(['success', 'info', 'warning', 'danger']);
  const toastType = allowedTypes.has(type) ? type : 'info';
  const closeButton = $('<button>', {
      type: 'button',
      class: 'close',
      'data-dismiss': 'alert',
      'aria-label': 'Close'
  }).append($('<span>', { 'aria-hidden': 'true' }).text('\u00d7'));
  const toastDiv = $('<div>', {
      class: `alert alert-${toastType} alert-dismissible toast-animate`,
      role: 'alert'
  }).css({ minWidth: '250px', marginTop: '10px' });

  toastDiv.append(closeButton, document.createTextNode(String(message)));

    $('#toast-container').append(toastDiv);

  // Auto-dismiss after duration
  setTimeout(function () {
    toastDiv.alert('close');
  }, duration);
}

$(document).ready(function () {
    parse_card_actions().then(function () {
        local_store_load();

    // accordion panel collapse fix
    $('#accordion .panel-collapse').on('show.bs.collapse', function(event){
        $('#accordion .panel-collapse').not(event.target).collapse('hide');
    });

    if (!window.showSaveFilePicker) {
        $('#download-settings-available,#download-settings-unavailable').toggleClass('hidden');
    }

    if (app_settings.show_download_settings) {
        $('#download-settings-opened').removeClass('hidden');
    } else {
        $('#download-settings-closed').removeClass('hidden');
    }

    $('#download-settings-show,#download-settings-hide').click(function(event) {
        $('#download-settings-opened,#download-settings-closed').toggleClass('hidden');
        app_settings.show_download_settings = event.target.id === 'download-settings-show';
        local_store_save();
    });

    $('#danger-zone-show,#danger-zone-hide').click(() => {
        $('#danger-zone-opened,#danger-zone-closed').toggleClass('hidden');
    });

    $('#clear-all').on('click', () => {
        if (confirm('Delete all saved data?\n\nThis will reset the entire app to its original state and erase all saved cards and settings.\n\nMake sure you’ve downloaded your cards before continuing.')) {
            localStorage.removeItem('card_data');
            localStorage.removeItem('card_options');
            localStorage.removeItem('app_settings');
            window.location.reload();
        }
    });

    // function ui_set_default_tab_values(options) {
    //     $("#default-icon-front").val(options.default_icon_front_container);
    //     $("#default-icon-back").val(options.default_icon_back);
    //     $("#default-icon-back-container").val(options.default_icon_back_container).trigger("change");
    //     $("#default-title-size").val(options.default_title_size);
    //     $("#default-card-font-size").val(options.default_card_font_size);
    // 	$("#default-card-background").val(options.default_background_image);
    // }

    // function ui_set_page_tab_values(options) {
    //    $("#card-size").val(options.card_size).change();
    //    $("#card-arrangement").val(options.card_arrangement).change();
    //    $("#page-rows").val(options.page_rows).change();
    //    $("#page-columns").val(options.page_columns).change();
    //    $("#back-bleed-width").val(options.back_bleed_width).change();
    //    $("#back-bleed-height").val(options.back_bleed_height).change();
    //    $("#page-zoom-keep-ratio").prop('checked', app_settings.page_zoom_keep_ratio);
    //    $("#page-zoom-width").val(options.page_zoom_width);
    //    $("#page-zoom-height").val(options.page_zoom_height);
    //    $("#card-zoom-width").val(options.card_zoom_width);
    //    $("#card-zoom-height").val(options.card_zoom_height);
    //    $("#rounded-corners").prop('checked', options.rounded_corners);
    // }

    UI_FIELDS_CONFIGURATION_PREPARE.forEach((prepareGroupConfig, key) => {
        UI_FIELDS_CONFIGURATION.set(key, prepareGroupConfig());
    });
    UI_FIELDS_CONFIGURATION.forEach(groupConfig => groupConfig.forEach(initField));

    function ui_reset_group_tab_values(group) {
        if (!confirm('Reset the current tab\'s value?')) return;
        getFieldGroup(group).forEach(field => field.reset());
        // if(group === 'page') {
        //     ui_set_page_tab_values(default_card_options());
        // } else if (group === 'default') {
        //     ui_set_default_tab_values(default_card_options());
        // }
    }

    $('#reset-page-tab-values').on('click', () => ui_reset_group_tab_values('page'));
    $('#reset-default-tab-values').on('click', () => ui_reset_group_tab_values('default'));
    
    // ui_set_page_tab_values(card_options);
    // ui_set_default_tab_values(card_options);

    // $('#default-icon-front').val(card_options.default_icon_front);
    // $('#default-icon-back').val(card_options.default_icon_back);
    // $('#default-title-size').val(card_options.default_title_size);
    // $('#default-card-font-size').val(card_options.default_card_font_size);

    // $('.icon-list').typeahead({
    //     source: icon_names,
    //     items: 'all',
    //     render: function (items) {
    //       var that = this;

    //       items = $(items).map(function (i, item) {
    //         i = $(that.options.item).data('value', item);
    //         i.find('a').html(that.highlighter(item));
    //         var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
    //         i.find('a').append('<span class="' + classname + '"></span>');
    //         return i[0];
    //       });

    //       if (this.autoSelect) {
    //         items.first().addClass('active');
    //       }
    //       this.$menu.html(items);
    //       return this;
    //     }
    // });

    // init file tab fields
    $("#button-load").click(function () {
        $("#file-load").attr({
            'data-opening': '',
            'data-clear-all': '',
        }).click();
    });
    $("#button-open").click(function () {
        if (card_data.length && document.getElementById('ask-before-delete').checked) {
            if (!confirm('This will delete all cards.\nAre you sure?')) return;
        }
        $("#file-load").attr({
            'data-opening': '1',
            'data-clear-all': '1',
        }).click();
    });
    $("#file-load").change(ui_load_files);
    
    // init deck tab fields
    $("#button-clear").click(function () { ui_clear_all(true); });
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
    $("#button-sort").click(ui_sort);
    $("#button-filter").click(ui_filter);
    $("#button-add-card").click(ui_add_new_card);
    $("#button-duplicate-card").click(ui_duplicate_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-copy-card").click(ui_copy_card);
    $("#button-copy-all").click(ui_copy_all_cards);
    $("#button-paste-card").click(ui_paste_card);
    $("#button-help").click(ui_open_help);

    // init page tab fields
    $("#page-zoom-100").click(() => {
        const keepRatio = app_settings.page_zoom_keep_ratio;
        if (keepRatio) app_settings.page_zoom_keep_ratio = false;
        getField("page-zoom-width").changeValue(100);
        getField("page-zoom-height").changeValue(100);
        if (keepRatio) app_settings.page_zoom_keep_ratio = true;
    });
    $("#page-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('page-width', 'page-height');
    });
    $("#card-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('card-width', 'card-height');
    });
    $("#grid-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('page-rows', 'page-columns');
    });
    $("#back-bleed-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('back-bleed-width', 'back-bleed-height');
    });
    $("#page-zoom-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('page-zoom-width', 'page-zoom-height');
    });
    $("#card-zoom-rotate").click($event => {
        $event.preventDefault();
        swapInputValues('card-zoom-width', 'card-zoom-height');
    });
    $("#button-generate").click(ui_generate);
    

    // init default tab fields
    $("#button-apply-default-title-size").click(() => ui_apply_card_default('card-title-size'));
    $("#button-apply-default-title-color").click(() => ui_apply_card_default('card-title-color'));
    $("#button-apply-default-card-font-size").click(() => ui_apply_card_default('card-font-size'));
    $("#button-apply-default-color-front").click(() => ui_apply_card_default('card-color-front'));
    $("#button-apply-default-icon-front").click(() => ui_apply_card_default('card-icon-front'));
    $("#button-apply-default-color-back").click(() => ui_apply_card_default('card-color-back'));
    $("#button-apply-default-icon-back").click(() => ui_apply_card_default('card-icon-back'));
    $("#button-apply-default-icon-back-rotation").click(() => ui_apply_card_default('card-icon-back-rotation'));
    $("#button-apply-default-icon-back-container").click(() => ui_apply_card_default('card-icon-back-container'));
    $("#button-apply-default-card-background").click(() => ui_apply_card_default('card-background'));

    $("#deck-cards-list").on('change', 'input[type=radio]', ui_update_selected_card);
    $("#deck-cards-list-title-filter").on('input change', ui_filter_selected_card_title);
    $('.search-clear-btn').each(function(){search_clear_button_init(this)});

    // ALL card fields now handled by Field class with valueGetter/valueSetter
    // jQuery handlers completely removed - Field class handles everything

    ui_update_card_list();
    });
});
