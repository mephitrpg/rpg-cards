// ============================================================================
// Card definition related functions
// ============================================================================
function default_card_options() {
  return {
    foreground_color: "white",
    background_color: "white",
    default_color_front: "black",
    default_color_back: "",
    default_icon_front: "",
    default_icon_back: "",
    default_icon_back_container: "rounded-square",
    default_title_size: "13",
    default_title_color: "white",
    default_card_font_size: "inherit",
    vertical_alignment_reference: "",
    page_size: "210mm,297mm",
    page_width: "210mm",
    page_height: "297mm",
    page_rows: "3",
    page_columns: "3",
    page_zoom_width: "100",
    page_zoom_height: "100",
    card_arrangement: "doublesided",
    card_size: "63mm,88mm",
    card_width: "63mm",
    card_height: "88mm",
    card_zoom_width: "63mm",
    card_zoom_height: "88mm",
    card_count: null,
    icon_inline: true,
    rounded_corners: true,
    back_bleed_width: "2mm",
    back_bleed_height: "2mm",
    card_type: "",
    crop_marks: true
  };
}

function default_card_data() {
  return {
    count: 1,
    title: '',
    contents: [],
    tags: []
  };
}

function card_init(card) {
  return {
    ...card,
    title: card.title || "",
    contents: card.contents || [],
    tags: card.tags || []
  }
}

function card_has_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  var index = card.tags.indexOf(tag);
  return index > -1;
}

function card_add_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  var index = card.tags.indexOf(tag);
  if (index === -1) {
    card.tags.push(tag);
  }
}

function card_remove_tag(card, tag) {
  tag = tag.trim().toLowerCase();
  card.tags = card.tags.filter(function (t) {
    return tag !== t;
  });
}

// ============================================================================
// Card definition related functions
// ============================================================================

function card_data_color_front(card_data, options) {
  return (
    card_data.color_front || options.default_color_front
  );
}

function card_data_color_back(card_data, options) {
  return (
    card_data.color_back || options.default_color_back || card_data.color_front || options.default_color_front
  );
}

function card_data_icon_front(card_data, options) {
  return card_data.icon_front || options.default_icon_front || "";
}

function card_data_icon_back(card_data, options) {
  return card_data.icon_back || options.default_icon_back || "";
}

function card_data_icon_back_container(card_data, options) {
  return card_data.icon_back_container || options.default_icon_back_container || "";
}

function card_data_icon_back_rotation(card_data, options) {
  return card_data.icon_back_rotation || options.default_icon_back_rotation || "";
}

function card_data_back_image(card_data, options) {
  return card_data.background_image || options.default_background_image || "";
}

function card_data_split_params(value) {
  return value.split("|").map(function (str) {
    return str.trim();
  });
}

function card_element_class(card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);
  return "card-element card-description-line" + card_font_size_class;
}

function card_size_class(card_data, options) {
  var card_font_size =
    card_data.card_font_size || options.default_card_font_size || "";
  return card_font_size != "" && card_font_size != "inherit"
    ? " card-font-size-" + card_font_size
    : "";
}

// ============================================================================
// Card element generating functions
// ============================================================================

function card_element_title(card_data, options) {
  var title = card_data.title_display || card_data.title || "";
  var title_size = card_data.title_size || options.default_title_size || "normal";
  var title_color = card_data.title_color || options.default_title_color || "";
  return (
    '<div class="card-title card-title-' + title_size + '" style="color: ' + title_color + '">' + title + "</div>"
  );
}

function card_element_type(card_data, options) {
  var type = card_data.card_type || "";
  var title_color = card_data.title_color || options.default_title_color || "";
  return type
    ? '<div class="card-type card-title card-title-10" style="color: ' + title_color + '">' + type + "</div>"
    : "";
}

function card_element_icon(card_data, options) {
  const re = /url\(\s*(['"]?)(.*?)\1\s*\)/;
  var icons = card_data_icon_front(card_data, options)
    .split(/[\s\uFEFF\xA0]+/)
    .filter((icon) => icon);
  var icon_color = card_data.icon_front_color || "";
  var classname = "icon";
  if (options.icon_inline) {
    classname = "inlineicon";
  }
  var result = `<div class="card-title-${classname}-container">`;
  result += icons.map(function (icon) {
    // append a temporary image to retrive the icon url
    const img = new Image();
    img.style.position = 'absolute';
    img.style.visibility = 'hidden';
    img.style.pointerEvents = 'none';
    img.className = `icon-${icon}`;
    document.body.appendChild(img);
    const match = getComputedStyle(img).backgroundImage?.match(re);
    let imgUrl = match ? match[2] : null;
    // sanitize url
    const u = new URL(imgUrl);
    imgUrl = ['http:', 'https:'].includes(u.protocol) ? u.href : ''; // u.href is percent encoded
    // remove temporary image
    img.remove();
    // colorize
    const style = icon_color ? `mask:url('${imgUrl}') no-repeat center / contain;background-color:${icon_color};background-image:none;` : '';
    // return html
    return `<span class="card-title-${classname} icon-${icon}" data-onload="fix-icon-size" data-src="${imgUrl}" style="${style}"></span>`;
  }).join('');
  result += `</div>`
  return result;
}

/**
 * @summary Starts a pill section.
 * @description Starts a pill section. Must be closed with `pills_end`.
 * @example pills_start
 * @category Pills
 */
function card_element_pills_start() {
  return '<div class="card-pills">';
}

/**
 * @summary A pill.
 * @description Displays a pill.
 * @example pill | text | html-color
 * @category Pills
 */
function card_element_pill(params, card_data, options) {
  var text = params[0];
  var color = params[1] || card_data_color_front(card_data, options);

  var result = "";
  result +=
    '<span class="card-pill label label-default" style="background-color:' +
    color +
    ';">';
  result += text;
  result += "</span>";
  return result;
}

/**
 * @summary Ends a pill section.
 * @description Ends a pill section.
 * @example pills_end
 * @category Pills
 */
function card_element_pills_end() {
  return "</div>";
}

/**
 * @summary A paragraph of italic text.
 * @description Creates a paragraph of italic text.
 * @example italic | text
 * @category Basic
 */
function card_element_italic(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result +=
    '   <p class="card-p card-description-text"><i>' + params[0] + "</i></p>";
  result += "</div>";
  return result;
}

/**
 * @summary Start a new table finish with table_end
 * @description Starts a new table. Must be closed with `table_end`.
 * @example table_start
 * @category Table
 */
function card_element_table_start(params, card_data, options) {
  return '<!-- table_start --><table class="card-stats"><tbody>';
}

/**
 * @summary Add a table heading row
 * @description Adds a header row to the table.
 * @example table_head | heading1 | heading2 | heading3 | … | headingN
 * @category Table
 */
function card_element_table_head(params, card_data, options) {
  var result = "<!-- table_head --><tr>";
  for (var i = 0; i < params.length; ++i) {
    result += '<th class="card-stats-header">' + params[i] + "</th>";
  }
  result += "</tr>";
  return result;
}

/**
 * @summary Add a table row
 * @description Adds a row to the table.
 * @example table_row | value1 | value2 | value3 | … | valueN
 * @category Table
 */
function card_element_table_row(params, card_data, options) {
  var result = "<!-- table_row --><tr>";
  for (var i = 0; i < params.length; ++i) {
    result += '<td class="card-stats-cell">' + params[i] + "</td>";
  }
  result += "</tr>";
  return result;
}

/**
 * @summary End a table started with table_start
 * @description Ends a table started with `table_start`.
 * @example table_end
 * @category Table
 */
function card_element_table_end(params, card_data, options) {
  return "<!-- table_end --></tbody></table>";
}

/**
 * @summary Input raw HTML.
 * @description Inserts raw HTML into the card.
 * @example html | html
 * @category Basic
 */
function card_element_html(params) {
  return params[0];
}

/**
 * @summary Input raw HTML affected by some extra formatting but wrapped by a DIV container.
 * @description Inserts raw HTML into the card.
 * @example rawhtml | html
 * @category Basic
 */
function card_element_rawhtml(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += params[0];
  result += "</div>";
  return result;
}

/**
 * @summary A subtitle.
 * @description Adds a subtitle to the card. The second parameter is optional and will be right-aligned. Supports multiple subtitles.
 * @example subtitle | text | right-aligned-text
 * @category Basic
 */
function card_element_subtitle(params, card_data, options) {
  let result = '<div class="card-element card-subtitle">';
  if (params?.length) {
    result += params.map(text => `<div>${text.trim()}</div>`).join('');
  }
  result += "</div>";
  return result;
}

/**
 * @summary An inline icon.
 * @description Displays an icon. The size and alignment are optional.
 * @example icon | icon-name | size | alignment
 * @category Layout
 */
function card_element_inline_icon(params, card_data, options) {
  var icon = params[0] || "";
  var size = params[1] || "40";
  var align = params[2] || "center";
  var color = card_data_color_front(card_data, options);
  return (
    '<div class="card-element card-inline-icon align-' +
    align +
    " icon-" +
    icon +
    '" style ="height:' +
    size +
    "px;min-height:" +
    size +
    "px;width: " +
    size +
    "px;background-color: " +
    color +
    '"></div>'
  );
}

/**
 * @summary A card footer with optional separated parts.
 * @description Displays a footer at the bottom of the card. If multiple parameters are provided, each is shown as a separate part with increasing font weight and separated by a ▹ symbol.
 * @example footer | text1 | text2 | text3 | ... | textN
 * @category Layout
 */
function card_element_footer(params, card_data, options) {
  var footer_text = params[0] || "";
  var color = card_data_color_front(card_data, options);
  // If there are multiple parameters, join them with separators
  if (params.length > 1) {
    var footer_parts = [];
    for (var i = 0; i < params.length; i++) {
      const oppositeLength = params.length - i - 1;
      const fontWeight = 200 + oppositeLength * 200;
      if (params[i] && params[i].trim() !== "") {
        footer_parts.push(
          '<span class="footer-part" style="font-weight: ' +
            fontWeight +
            ';">' +
            params[i].trim() +
            "</span>"
        );
      }
    }
    footer_text = footer_parts.join(
      '<span class="footer-separator"> ▹ </span>'
    );
  }
  return (
    '<div class="card-footer" style="background-color: ' +
    color +
    ';"><p class="card-footer-text">' +
    footer_text +
    "</p></div>"
  );
}

/**
 * @summary An inline picture.
 * @description Displays a picture from a URL.
 * @example picture | url | height
 * @category Layout
 */
function card_element_picture(params, card_data, options) {
  var url = params[0] || "";
  var height = params[1] || "";
  return (
    '<div class="card-element card-picture" style ="background-image: url(&quot;' +
    url +
    "&quot;); background-size: contain; background-position: center;background-repeat: no-repeat; height:" +
    height +
    'px"></div>'
  );
}

/**
 * @summary A horizontal ruler.
 * @description Displays a horizontal ruler.
 * @example ruler
 * @category Layout
 */
function card_element_ruler(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = 'fill="' + color + '"';
  var stroke = 'stroke="' + color + '"';
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<svg class="card-ruler' +
    card_font_size_class +
    '" height="1" width="100" viewbox="0 0 100 1" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
  result += '    <polyline points="0,0 100,0.5 0,1" ' + fill + "></polyline>";
  result += "</svg>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition horizontal ruler.
 * @description Displays a horizontal ruler with the Pathfinder 2nd Edition style.
 * @example p2e_ruler
 * @category Pathfinder 2e
 */
function card_element_p2e_ruler(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = 'fill="' + color + '"';
  var stroke = 'stroke="' + color + '"';
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<svg class="card-p2e-ruler' +
    card_font_size_class +
    '" height="1" width="100" viewbox="0 0 100 5" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
  result += '    <polyline points="0,0 100,0.5 0,1" ' + fill + "></polyline>";
  result += "</svg>";
  return result;
}

/**
 * @summary A line of empty boxes.
 * @description Displays a number of empty boxes. The size and text are optional.
 * @example boxes | number | size | text
 * @category Layout
 */
function card_element_boxes(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var fill = ' fill="none"';
  var stroke = ' stroke="' + color + '"';
  var count = params[0] || 1;
  var size = params[1] || 3;
  var additional_text = params[2] || "";
  var style = 'style="width:' + size + "em;height:" + size + 'em"';
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  for (var i = 0; i < count; ++i) {
    result +=
      '<svg class="card-box" height="100" width="100" viewbox="0 0 100 100" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg" ' +
      style +
      ">";
    result +=
      '    <rect x="5" y="5" width="90" height="90" ' +
      fill +
      stroke +
      ' style="stroke-width:10">';
    result += "</svg>";
  }
  result += additional_text + "</div>";
  return result;
}

/**
 * @summary A property line.
 * @description Displays a property with a name and a value.
 * @example property | name | value
 * @category Basic
 */
function card_element_property(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<div class="card-element card-property-line' + card_font_size_class + '">';
  result += '   <h4 class="card-property-name">' + params[0] + "</h4>";
  result += '   <p class="card-p card-property-text">' + params[1] + "</p>";
  if (params[2]) {
    result += '   <div style="float:right">';
    result += '       <h4 class="card-property-name">' + params[2] + "</h4>";
    result +=
      '       <p class="card-p card-property-text">' + params[3] + "</p>";
    result += "   </div>";
  }
  result += "</div>";
  return result;
}

/**
 * @summary A description line.
 * @description Displays a description with a name and a value.
 * @example description | name | value
 */
function card_element_description(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += '   <h4 class="card-description-name">' + params[0] + "</h4>";
  result += '   <p class="card-p card-description-text">' + params[1] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A paragraph of text.
 * @description Displays a paragraph of text.
 * @example text | text
 * @category Basic
 */
function card_element_text(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A centered paragraph of text.
 * @description Displays a centered paragraph of text.
 * @example center | text
 * @category Basic
 */
function card_element_center(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result += '<div class="' + element_class + '" style="text-align: center">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A justified paragraph of text.
 * @description Displays a justified paragraph of text.
 * @example justify | text
 * @category Basic
 */
function card_element_justify(params, card_data, options) {
  var element_class = card_element_class(card_data, options);

  var result = "";
  result +=
    '<div class="' +
    element_class +
    '" style="text-align: justify; hyphens: auto">';
  result += '   <p class="card-p card-description-text">' + params[0] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A grey divider bar.
 * @description Adds a grey divider bar with optional centered text. Useful for visually separating sections within a card.
 * @example divider | text
 * @category Layout
 */
function card_element_divider(params, card_data, options) {
  var result = "";
  result +=
    '<div class="card-element card-description-line" style="text-align: center; background-color: lightgray">';
  result +=
    '   <p class="card-p card-description-text">' +
    (params[0] || "&nbsp;") +
    "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A D&D stat block.
 * @description Displays a D&D 5e stat block.
 * @example dndstats | STR | DEX | CON | INT | WIS | CHA
 * @category DnD
 */
function card_element_dndstats(params, card_data, options) {
  var stats = [10, 10, 10, 10, 10, 10];
  var mods = [0, 0, 0, 0, 0, 0];
  for (var i = 0; i < 6; ++i) {
    stats[i] = parseInt(params[i], 10) || 0;
    var mod = Math.floor((stats[i] - 10) / 2);
    if (mod >= 0) {
      mod = "+" + mod;
    } else {
      mod = "" + mod;
    }
    mods[i] = "&nbsp;(" + mod + ")";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">STR</th>';
  result += '      <th class="card-stats-header">DEX</th>';
  result += '      <th class="card-stats-header">CON</th>';
  result += '      <th class="card-stats-header">INT</th>';
  result += '      <th class="card-stats-header">WIS</th>';
  result += '      <th class="card-stats-header">CHA</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">' + stats[0] + mods[0] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[1] + mods[1] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[2] + mods[2] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[3] + mods[3] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[4] + mods[4] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[5] + mods[5] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  return result;
}

/**
 * @summary A Shadowrun 6th Edition spell block.
 * @description Displays a Shadowrun 6th Edition spell block.
 * @example sr6spell | Range | Type | Duration | Drain | Damage
 * @category Shadowrun 6e
 */
function card_element_sr6spell(params, card_data, options) {
  var stats = [];
  for (var i = 0; i < 5; ++i) {
    stats[i] = params[i] || "";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">Range</th>';
  result += '      <th class="card-stats-header">Type</th>';
  result += '      <th class="card-stats-header">Duration</th>';
  result += '      <th class="card-stats-header">Drain</th>';
  result += '      <th class="card-stats-header">Damage</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">' + stats[0] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[1] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[2] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[3] + "</td>";
  result += '      <td class="card-stats-cell">' + stats[4] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition stat block.
 * @description Displays a Pathfinder 2nd Edition stat block.
 * @example p2e_stats | STR | DEX | CON | INT | WIS | CHA | AC | Fort | Ref | Will | HP
 * @category Pathfinder 2e
 */
function card_element_p2e_stats(params, card_data, options) {
  var result = "";
  result += '<div class="card-p2e-attribute-line">';
  result += '   <p class="card-p2e-attributes-text">';
  result +=
    "       <b>Str</b> " +
    params[0] +
    ", <b>Dex</b> " +
    params[1] +
    ", <b>Con</b> " +
    params[2] +
    ", <b>Int</b> " +
    params[3] +
    ", <b>Wis</b> " +
    params[4] +
    ", <b>Cha</b> " +
    params[5];
  result += "   </p>";
  result += "</div>";
  result += card_element_p2e_ruler(params, card_data, options);
  result += '<div class="card-p2e-attribute-line">';
  result += '   <p class="card-p2e-attributes-text">';
  result +=
    "       <b>AC </b> " +
    params[6] +
    "; <b>Fort</b> " +
    params[7] +
    "; <b>Ref</b> " +
    params[8] +
    "; <b>Will</b> " +
    params[9];
  result += "   </p>";
  result += '   <p class="card-p2e-attributes-text">';
  result += "       <b>HP </b> " + params[10];
  result += "   </p>";
  result += "</div>";
  return result;
}

/**
 * @summary Starts a Pathfinder 2nd Edition trait section.
 * @description Starts a Pathfinder 2nd Edition trait section. Must be closed with `p2e_end_trait_section`.
 * @example p2e_start_trait_section
 * @category Pathfinder 2e
 */
function card_element_start_p2e_trait() {
  return '<div class="card-p2e-trait-container">';
}

/**
 * @summary Ends a Pathfinder 2nd Edition trait section.
 * @description Ends a Pathfinder 2nd Edition trait section.
 * @example p2e_end_trait_section
 * @category Pathfinder 2e
 */
function card_element_end_p2e_trait() {
  return "</div>";
}

/**
 * @summary A Pathfinder 2nd Edition trait.
 * @description Displays a Pathfinder 2nd Edition trait.
 * @example p2e_trait | rarity | text
 * @category Pathfinder 2e
 */
function card_element_p2e_trait(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);
  var badge_type = " card-p2e-trait-" + params[0];

  var result = "";
  result +=
    '<span class="card-p2e-trait' + badge_type + card_font_size_class + '">';
  result += params[1];
  result += "</span>";
  return result;
}

/**
 * @summary A Pathfinder 2nd Edition activity.
 * @description Displays a Pathfinder 2nd Edition activity.
 * @example p2e_activity | name | actions | description
 * @category Pathfinder 2e
 */
function card_element_p2e_activity(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var activity_icon;
  if (params[1] == "0") {
    activity_icon = "icon-p2e-free-action";
  } else if (params[1] == "1") {
    activity_icon = "icon-p2e-1-action";
  } else if (params[1] == "2") {
    activity_icon = "icon-p2e-2-actions";
  } else if (params[1] == "3") {
    activity_icon = "icon-p2e-3-actions";
  } else if (params[1] == "R") {
    activity_icon = "icon-p2e-reaction";
  }

  var result = "";
  result +=
    '<div class="card-element card-property-line' + card_font_size_class + '">';
  result += '   <h4 class="card-property-name">' + params[0] + "</h4>";
  result +=
    '   <div class="card-inline-icon ' +
    activity_icon +
    '" style="display: inline-block; vertical-align: middle; height: 10px; min-height: 10px; width: 10px; background-color: black;"></div>';
  result += '   <p class="card-p card-property-text">' + params[2] + "</p>";
  result += "</div>";
  return result;
}

/**
 * @summary A Savage Worlds stat block.
 * @description Displays a Savage Worlds stat block.
 * @example swstats | Agility | Smarts | Spirit | Strength | Vigor | Pace | Parry | Toughness | Loot
 * @category Savage Worlds
 */
function card_element_swstats(params, card_data, options) {
  var stats = [];
  for (var i = 0; i < 9; ++i) {
    stats[i] = params[i] || "-";
  }
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result += '<table class="card-stats' + card_font_size_class + '">';
  result += "    <tbody><tr>";
  result += '      <th class="card-stats-header">Agility</th>';
  result += '      <th class="card-stats-header">Smarts</th>';
  result += '      <th class="card-stats-header">Spirit</th>';
  result += '      <th class="card-stats-header">Strength</th>';
  result += '      <th class="card-stats-header">Vigor</th>';
  result += "    </tr>";
  result += "    <tr>";
  result += '      <td class="card-stats-cell">d' + stats[0] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[1] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[2] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[3] + "</td>";
  result += '      <td class="card-stats-cell">d' + stats[4] + "</td>";
  result += "    </tr>";
  result += "  </tbody>";
  result += "</table>";
  result += '<p class="card-stats-sw-derived">';
  result += " <b>Pace</b> " + stats[5];
  result += " <b>Parry</b> " + stats[6];
  result += " <b>Toughness</b> " + stats[7];
  result += stats[8] ? " <b>Loot</b> " + stats[8] : "";
  result += "</p>";
  return result;
}

/**
 * @summary A bulleted list item.
 * @description Displays a bulleted list item.
 * @example bullet | text
 * @category Basic
 */
function card_element_bullet(params, card_data, options) {
  var card_font_size_class = card_size_class(card_data, options);

  var result = "";
  result +=
    '<ul class="card-element card-bullet-line' + card_font_size_class + '">';
  result += '   <li class="card-bullet">' + params[0] + "</li>";
  result += "</ul>";
  return result;
}

/**
 * @summary A section header.
 * @description Displays a section header. The second parameter is optional and will be right-aligned.
 * @example section | title | right-aligned-text
 * @category Basic
 */
function card_element_section(params, card_data, options) {
  var color = card_data_color_front(card_data, options);
  var section = params[0] || "";

  var result = '<h3 class="card-section" style="color:' + color + '">';
  if (params[1]) {
    result += '<div style="float:right">' + params[1] + "</div>";
  }
  result += "<div>" + section + "</div>";
  result += "</h3>";

  return result;
}

/**
 * @summary A flexible vertical space.
 * @description Adds a flexible vertical space that fills the available space.
 * @example fill | flex-grow
 * @category Layout
 */
function card_element_fill(params, card_data, options) {
  var flex = params[0] || "1";
  return '<span class="card-fill" style="flex:' + flex + '"></span>';
}

function card_element_unknown(params, card_data, options) {
  return "<div>Unknown element: " + params.join("<br />") + "</div>";
}

function card_element_empty(params, card_data, options) {
  return "";
}

const card_element_generators = {
  subtitle: card_element_subtitle,
  property: card_element_property,
  rule: card_element_ruler,
  ruler: card_element_ruler,
  p2e_rule: card_element_p2e_ruler,
  p2e_ruler: card_element_p2e_ruler,
  boxes: card_element_boxes,
  description: card_element_description,
  dndstats: card_element_dndstats,
  p2e_stats: card_element_p2e_stats,
  p2e_start_trait_section: card_element_start_p2e_trait,
  p2e_trait: card_element_p2e_trait,
  p2e_end_trait_section: card_element_end_p2e_trait,
  p2e_activity: card_element_p2e_activity,
  pills_start: card_element_pills_start,
  pill: card_element_pill,
  pills_end: card_element_pills_end,
  table_start: card_element_table_start,
  table_head: card_element_table_head,
  table_row: card_element_table_row,
  table_end: card_element_table_end,
  swstats: card_element_swstats,
  sr6spell: card_element_sr6spell,
  text: card_element_text,
  italic: card_element_italic,
  html: card_element_html,
  rawhtml: card_element_rawhtml,
  center: card_element_center,
  justify: card_element_justify,
  divider: card_element_divider,
  bullet: card_element_bullet,
  fill: card_element_fill,
  section: card_element_section,
  disabled: card_element_empty,
  picture: card_element_picture,
  icon: card_element_inline_icon,
  footer: card_element_footer,
};

// ============================================================================
// Card generating functions
// ============================================================================

function card_generate_contents(card_data, options) {
  let result = '';
  const contents = card_data.contents;

  let html = contents
    .map(function (value) {
      const [element_name, ...element_params] = card_data_split_params(value);
      const element_generator = card_element_generators[element_name];
      if (element_generator) {
        return element_generator(element_params, card_data, options);
      }
      if (element_name.length > 0) {
        return card_element_unknown(element_params, card_data, options);
      }
    })
    .join('\n');

  const tagNames = ['icon'];

  tagNames.forEach(function (tagName) {
    const tagRegExp = new RegExp(`<${tagName}[^>]*>`, 'g');
    const attrRegExp = new RegExp(`([\\w-]+)="([^"]+)"`, 'g');

    const matches = [];
    forEachMatch(tagRegExp, html, function (m) {
      matches.push(m);
    });
    if (!matches.length) return null;

    var tagResults = new Array(matches.length);
    matches.forEach(function (match, i) {
      if (tagName === "icon") {
        var attrs = {};
        forEachMatch(attrRegExp, match[0], function (m, i) {
          const [attrName, attrValue] = m.splice(1);
          if (attrName === "name") {
            if (!attrs.class) attrs.class = "";
            attrs.class += "game-icon game-icon-" + attrValue;
          } else if (attrName === "size") {
            if (!attrs.style) attrs.style = "";
            if (Number.isFinite(Number(attrValue))) attrs.style += "font-size:" + attrValue + "pt;";
            else attrs.style += "font-size:" + attrValue + ";";
          } else if (attrName === "color") {
            if (!attrs.style) attrs.style = "";
            attrs.style += "color:" + attrValue + ";";
          }
        });
        forEachMatch(attrRegExp, match[0], function (m, i) {
          var attrName = m[1];
          var attrValue = m[2];
          if (attrName === "style") {
            if (!attrs.style) attrs.style = "";
            attrs.style += attrValue;
          }
        });
        var tagResult = "<i";
        Object.keys(attrs).forEach(function (k) {
          tagResult += " " + k + '="' + attrs[k] + '"';
        });
        tagResult += "></i>";
        tagResults[i] = tagResult;
      }
    });

    html = html.replace(tagRegExp, function () {
      return tagResults.shift();
    });
  });

  result += `<div class="card-content-container">${html}</div>`;
  return result;
}

function card_repeat(card, count) {
  var result = [];
  for (var i = 0; i < count; ++i) {
    result.push(card);
  }
  return result;
}

function card_generate_crop_marks(card_data, options, params = {}) {
  const {
    isPreview
  } = params;

  const bleed_width_half = `calc(${options.back_bleed_width} / 2)`;
  const bleed_height_half = `calc(${options.back_bleed_height} / 2)`;
  
  if (!options.crop_marks || isPreview) return '';

  return `
      <div class="crop-mark crop-mark-top-left-v hide" style="left:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-top-right-v hide" style="right:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-bottom-left-v hide" style="left:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-bottom-right-v hide" style="right:${bleed_width_half};"></div>
      <div class="crop-mark crop-mark-top-left-h hide" style="top:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-bottom-left-h hide" style="bottom:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-top-right-h hide" style="top:${bleed_height_half};"></div>
      <div class="crop-mark crop-mark-bottom-right-h hide" style="bottom:${bleed_height_half};"></div>
  `;
}

function card_generate_color_front_style(color, data = {}, options = {}) {
  return `style="color:${color};border-color:${color};background-color:${color}"`;
}

function card_generate_color_back_style(color, data = {}, options = {}) {
  return `style="color:${color};background-color:${color}"`;
}

function card_generate_back_icon_style(color, data = {}, options = {}) {
  const rotation = card_data_icon_back_rotation(data, options);
  let bgStyle = '';
  if (data.icon_back_container !== 'none') {
    bgStyle = `background-repeat: no-repeat; transform: rotate(${rotation}deg);`;
  }
  return `style="${bgStyle}"`;
}

function card_generate_back_icon_container_style(color, data = {}, options = {}) {
  let bgStyle = '';
  if (data.icon_back_container !== 'none') {
    bgStyle = `border-color:${color}; background-color:${color}; display: flex; justify-content: center; align-items: center;`;
  }
  return `style="${bgStyle}"`;
}

function card_generate_color_gradient_style(color, options) {
  return `style="background: radial-gradient(ellipse at center, white 20%, ${color} 120%);"`;  
}

function add_to_style(style = ' style=""', css) {
  // style string example ----> `style="color:red;"`
  const finalQuote = style.slice(-1) === '"' ? '"' : '';
  let result = finalQuote ? style.slice(0, -1) : style;
  const lastChar = result.slice(-1);
  if (lastChar !== ';' && lastChar !== '"') {
    result += ';';
  }
  for (const [key, value] of Object.entries(css)) {
    result += `${key}:${value};`;
  }
  result += finalQuote;
  return result;
}

function add_size_to_style(style, width, height) {
  return add_to_style(style, { width, height });
}

function add_bleed_to_style(style) {
  return add_to_style(style, { padding: `calc(${card_options.back_bleed_height}/2) calc(${card_options.back_bleed_width}/2)` });
}


function card_generate_front(data, options, { isPreview }) {
  var color = card_data_color_front(data, options);
  var style_color = card_generate_color_front_style(color, data, options);

  var width = options.card_width;
  var height = options.card_height;

  var back_bleed_width = options.back_bleed_width;
  var back_bleed_height = options.back_bleed_height;

  var card_width = "calc(" + width + " + " + back_bleed_width + ")";
  var card_height = "calc(" + height + " + " + back_bleed_height + ")";

  var card_style = isPreview ? add_size_to_style(style_color, width, height) : add_size_to_style(style_color, card_width, card_height);
  var card_content_style = isPreview ? '' : add_bleed_to_style();

  const cardClasses = ['card'];
  if (options.rounded_corners) cardClasses.push('rounded-corners');
  if (data.vertical_alignment_reference === 'content-area') cardClasses.push('valignref-content-area'); 

  return `<div class="${cardClasses.join(' ')}" ${card_style}>
    <div class="card-content" ${card_content_style}>
      ${data.header_show === 'none' ? '' : `<div class="card-header">
        ${card_element_title(data, options)}
        ${card_element_type(data, options)}
        ${card_element_icon(data, options)}
      </div>`}
      ${card_generate_contents(data, options)}
    </div>
    <div>
      ${card_generate_crop_marks(data, options, { isPreview })}
    </div>
  </div>`;
}

function card_generate_back_html({
  renderInner = true,
  card_style = '',
  corners_class = '',
  card_content_style = '',
  card_background_style = '',
  icon_container,
  icon_container_style,
  icon,
  icon_style,
  crop_marks = ''
}) {
  let card = `<div class="card ${corners_class}" ${card_style}>`;

  card += `<div class="card-content" ${card_content_style}>`;
  card += `<div class="card-back" ${card_background_style}>`;

  if (renderInner) {
    card += `
      <div class="card-back-inner">
        <div class="card-back-icon card-back-icon-${icon_container}" ${icon_container_style}>
          <div class="icon-${icon}" ${icon_style}></div>
        </div>
      </div>
    `;
  }

  card += `</div>`;
  card += `</div>`;

  if (crop_marks) {
    card += `<div>${crop_marks}</div>`;
  }

  card += `</div>`;

  return card;
}


function card_generate_back(data, options, { isPreview }) {
  var color = card_data_color_back(data, options);
  var style_color = card_generate_color_back_style(color, data, options);

  var width = options.card_width;
  var height = options.card_height;

  var back_bleed_width = options.back_bleed_width;
  var back_bleed_height = options.back_bleed_height;

  var card_width = "calc(" + width + " + " + back_bleed_width + ")";
  var card_height = "calc(" + height + " + " + back_bleed_height + ")";

  var card_style = isPreview ? add_size_to_style(style_color, width, height) : add_size_to_style(style_color, card_width, card_height);

  const $tmpCard = $(card_generate_back_html({ card_style }));
  const $tmpCardContainer = $('<div style="position:absolute;visibility:hidden;pointer-events:none;"></div>');
  $("#preview-container").append($tmpCardContainer.append($tmpCard));

  var $tmpCardInner = $tmpCard.find(".card-back-inner");
  var innerWidth = $tmpCardInner.width();
  var innerHeight = $tmpCardInner.height();
  var iconContainerSize = Math.min(innerWidth, innerHeight) / 2;
  $tmpCardContainer.remove();

  var url = data.background_image;
  var card_background_style = "";
  if (url) {
    card_background_style = `style="background-image: url(&quot;${url}&quot;); background-size: contain; background-position: center; background-repeat: no-repeat;"`;
  } else {
    card_background_style = card_generate_color_gradient_style(color, options);
  }
  var icon = card_data_icon_back(data, options);
  var icon_container = card_data_icon_back_container(data, options);

  var icon_container_style = add_size_to_style(card_generate_back_icon_container_style(color, data, options), `${iconContainerSize}px`, `${iconContainerSize}px`);
  var icon_style = card_generate_back_icon_style(color, data, options);

  var card_content_style = add_bleed_to_style();

  return card_generate_back_html({
    renderInner: !url,
    card_style,
    corners_class: options.rounded_corners  ? "rounded-corners" : "",
    card_content_style,
    card_background_style,
    url,
    icon_container,
    icon_container_style,
    icon,
    icon_style,
    crop_marks: card_generate_crop_marks(data, options, { isPreview })
  });
}

function card_generate_empty(count, options, is_back) {
  var card_width = options.card_width;
  var card_height = options.card_height;

    var style_color = card_generate_color_back_style("white");
    var back_bleed_width = options.back_bleed_width;
    var back_bleed_height = options.back_bleed_height;
    card_width = "calc(" + card_width + " + " + back_bleed_width + ")";
    card_height = "calc(" + card_height + " + " + back_bleed_height + ")";

  var card_style = add_size_to_style(style_color, card_width, card_height);
  var result = "";
  var back_front_class = is_back ? "back" : "front";
  result +=
    '<div class="card empty ' + back_front_class + '" ' + card_style + ">";
  result += card_generate_crop_marks({}, options);
  result += "</div>";

  return card_repeat(result, count);
}

// ============================================================================
// Functions that generate pages of cards
// ============================================================================

function card_pages_split(data, rows, cols) {
  var cards_per_page = rows * cols;
  var result = [];
  for (var i = 0; i < data.length; i += cards_per_page) {
    var page = data.slice(i, i + cards_per_page);
    result.push(page);
  }
  return result;
}

function card_pages_merge(front_pages, back_pages) {
  var result = [];
  for (var i = 0; i < front_pages.length; ++i) {
    result.push(front_pages[i]);
    result.push(back_pages[i]);
  }
  return result;
}

function card_pages_add_padding(cards, options, is_back) {
  var cards_per_page = options.page_rows * options.page_columns;
  var last_page_cards = cards.length % cards_per_page;
  if (last_page_cards !== 0) {
    return cards.concat(
      card_generate_empty(cards_per_page - last_page_cards, options, is_back)
    );
  } else {
    return cards;
  }
}

function card_pages_interleave_cards(front_cards, back_cards, options) {
  var result = [];
  var i = 0;
  while (i < front_cards.length) {
    result.push(front_cards[i]);
    result.push(back_cards[i]);
    if (options.page_columns > 2) {
      result.push(
        card_generate_empty(options.page_columns - 2, options, false)
      );
    }
    ++i;
  }
  return result;
}

function card_pages_interleave_cards_alt(front_cards, back_cards, options) {
  var result = [];
  var i = 0;
  while (i < front_cards.length) {
    if (i % 2) {
      result.push(back_cards[i]);
      result.push(front_cards[i]);
    } else {
      result.push(front_cards[i]);
      result.push(back_cards[i]);
    }
    if (options.page_columns > 2) {
      result.push(
        card_generate_empty(options.page_columns - 2, options, false)
      );
    }
    ++i;
  }
  return result;
}

function card_pages_wrap(pages, options) {
  // force portrait layout then rotate if landscape
  var orientation = getOrientation(options.page_width, options.page_height);
  var pageWidth = options.page_width;
  var pageHeight = options.page_height;

  var result = "";
  for (var i = 0; i < pages.length; ++i) {
    var style = 'style="';
    if (options.card_arrangement === "doublesided" && i % 2 === 1) {
      style += "background-color:" + options.background_color + ";";
    } else {
      style += "background-color:" + options.foreground_color + ";";
    }
    style += '"';
    style = add_size_to_style(
      style,
      pageWidth,
      pageHeight
    );

    var zw = options.page_zoom_width / 100;
    var zh = options.page_zoom_height / 100;
    var zoomStyle = 'style="';
    zoomStyle += `transform: scale(${zw}, ${zh});`;
    if (options.card_arrangement === "doublesided" && i % 2 === 1) {
      zoomStyle += "flex-direction:" + "row-reverse" + ";";
    }
    zoomStyle += '"';
    zoomStyle = add_size_to_style(
      zoomStyle,
      `calc((${options.card_width} + ${options.back_bleed_width}) * ${options.page_columns})`,
      `calc((${options.card_height} + ${options.back_bleed_height}) * ${options.page_rows})`
    );

    result +=
      '<page class="page page-preview ' + orientation + '" ' + style + ">\n";
    result += '<div class="page-zoom page-zoom-preview" ' + zoomStyle + ">\n";
    result += pages[i].join("\n");
    result += "</div>\n";
    result += "</page>\n";
  }
  return result;
}

function card_pages_generate_style(options) {
  var result = `
  @page {
      margin: 0;
      size:${options.page_width} ${options.page_height};
      print-color-adjust: exact;
  }
  `;
  return `<style>${result}</style>`;
}

function card_pages_generate_html(card_data, options) {
  const defaultOptions = default_card_options();
  options = options || defaultOptions;
  var rows = options.page_rows || defaultOptions.page_rows;
  var cols = options.page_columns || defaultOptions.page_columns;

  // Generate the HTML for each card
  var front_cards = [];
  var back_cards = [];
  card_data.forEach(function (data, i) {
    var count = options.card_count || data.count || 1;
    var front = card_generate_front(data, options, { isPreview: false });
    var back = card_generate_back(data, options, { isPreview: false });
    front_cards = front_cards.concat(card_repeat(front, count));
    back_cards = back_cards.concat(card_repeat(back, count));
  });

  var pages = [];
  if (options.card_arrangement === "doublesided") {
    // Add padding cards so that the last page is full of cards
    front_cards = card_pages_add_padding(front_cards, options, false);
    back_cards = card_pages_add_padding(back_cards, options, true);
    // Split cards to pages
    var front_pages = card_pages_split(front_cards, rows, cols);
    var back_pages = card_pages_split(back_cards, rows, cols);
    // Interleave front and back pages so that we can print double-sided
    pages = card_pages_merge(front_pages, back_pages);
  } else if (options.card_arrangement === "front_only") {
    var cards = card_pages_add_padding(front_cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  } else if (options.card_arrangement === "side_by_side") {
    var cards = card_pages_interleave_cards(front_cards, back_cards, options);
    cards = card_pages_add_padding(cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  } else if (options.card_arrangement === "side_by_side_alt") {
    var cards = card_pages_interleave_cards_alt(
      front_cards,
      back_cards,
      options
    );
    cards = card_pages_add_padding(cards, options, false);
    pages = card_pages_split(cards, rows, cols);
  }

  return {
    style: card_pages_generate_style(options),
    html: card_pages_wrap(pages, options),
    pages
  };
}
