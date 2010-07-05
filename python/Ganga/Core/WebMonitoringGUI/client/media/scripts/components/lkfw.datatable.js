// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// Requirements:
// - jquery.dataTables.min.js
// - jquery.ba-bbq.min.js
//
// History:
// 18.05.2010 Created
//

(function($) {
    $.fn.lkfw_dataTable = function(settings) {
        var _config = {
            'dTable': [],
            'tableId': 'srchList',
            'items': [],
            'tblLabels': [],
            'dataTable':{},
            'expandableRows':false,
            'multipleER':false,   // Multiple expandable rows
            'rowsToExpand':[],
            'sorting':[0,'desc'],
            'fnERContent':function(dataID, onlyData){ return [['error','Data provider function not set up!']] },
            'fnContentChange':function(el){ alert('Please define a proper function to handle "fnContentChange"!'); },
            'fnERClose':function(dataID){ alert('Please define a proper function to handle "fnERClose"!'); }
        };
        
        var _tablePlus = 'media/images/table_plus.png';
        var _tableMinus = 'media/images/table_minus.png';
        
        var _buildTable = function(elCnt) {
            var table = $('<table></table>').attr({
                id: 'dataTable_'+elCnt,
                cellpadding: '0',
                cellspacing: '1'
            }).addClass('display');
            var colHeaders = $('<tr></tr>');
            for (i in _config.tblLabels) colHeaders.append($('<th></th>').text(_config.tblLabels[i]));
            var colFooters = colHeaders.clone();
            var tblHead = $('<thead></thead>').append(colHeaders);
            var tblFoot = $('<tfoot></tfoot>').append(colFooters);
            
            table.append(tblHead);
            table.append(tblFoot);
            
            return table;
        };
        
        var _buildExpandedRow = function(trID, trClass) {
            var dataArr = _config.fnERContent(trID[0]);
            var mainTR = $('<tr></tr>').attr({
                'id': 'expand_'+trID[0]
            }).addClass('expand').addClass(trClass);
            var mainTD = $('<td></td>').attr({
                'colspan': _config.tblLabels.length
            }).addClass('sorting_1');
            var mainDIV = $('<div></div>');
            var table = $('<table></table>').attr({
                cellpadding: '0',
                cellspacing: '1'
            }).addClass('expTable');
            var tr;
            for (i in dataArr) {
                tr = $('<tr></tr>');
                tdKEY = $('<td></td>').addClass('orKEYS').text(dataArr[i][0]);
                tdVAL = $('<td></td>').addClass('orVALS').text(dataArr[i][1]);
                tr.append(tdKEY).append(tdVAL);
                table.append(tr);
            }
            mainTD.append(table);
            mainTR.append(mainTD);
            
            return mainTR;
        };
        
        var _givPlus = function(iteration) {
            return '<img id="tablePlus_'+iteration+'" class="tablePlus" src="'+_tablePlus+'" />';
        };
        
        var _expandClick = function(dTable) {
            $('.rExpand').unbind();
            $('.rExpand').click(function(){
                var trID = dTable.fnGetPosition( this );
                if (_config.multipleER) {
                    if ($('#expand_'+trID[0]).length == 0) {
                        $('#tablePlus_'+trID[0]).attr('src', _tableMinus);
                        // Create row
                        $(this).parent().after(_buildExpandedRow(trID, $(this).parent().attr('class')));
                    }
                    else {
                        _config.fnERClose(trID[0]);
                        $('#tablePlus_'+trID[0]).attr('src', _tablePlus);
                        $('#expand_'+trID[0]).remove();
                    }
                }
                else {
                    // Close other
                    var isNotCurrent = ($('#expand_'+trID[0]).length == 0);
                    $('.expand').remove();
                    $('.tablePlus').attr('src', _tablePlus);
                    
                    // Open current
                    if (isNotCurrent) {
                        $(this).children('.tablePlus').attr('src', _tableMinus);
                        $(this).parent().after(_buildExpandedRow(trID, $(this).parent().attr('class')));
                    }
                    else {
                        _config.fnERClose(trID[0]);
                    }
                }
            });
        };
 
        if (settings) $.extend(_config, settings);
        
        if (_config.expandableRows) {
            // Adding first column with + sign
            // Setting up column settings if they are not exists
            if (!_config.dataTable.aoColumns) {
                _config.dataTable.aoColumns = Array();
                for (i in _config.tblLabels) {
                    _config.dataTable.aoColumns.push(null);
                }
            }
            // Adding empty column label
            _config.tblLabels = $.merge([''], _config.tblLabels);
            
            // Adding PLUS image to every row
            for (var i=0; i<_config.items.length; i++) {
                _config.items[i] = $.merge([_givPlus(i)], _config.items[i]);
            }
            
            // Setting up PLUS column
            _config.dataTable.aoColumns = $.merge([{ 
                sWidth:'10px',
                bSortable:false, 
                sClass:'rExpand'
            }],_config.dataTable.aoColumns);
        }
        
        var elCnt = 0;
        var dTablesArr = Array();
        this.each(function() {
		    dTable = _config.dTable[elCnt];
            if (!dTable) {
                $(this).empty().append(_buildTable(elCnt));
                dTable = $('#dataTable_'+elCnt).dataTable( $.extend({
					    "bJQueryUI": true,
					    "sPaginationType": "full_numbers",
					    "bAutoWidth":false,
					    "aaSorting": [[_config.sorting[0],_config.sorting[1]]],
		        },_config.dataTable));
		    }
		    else {
		        dTable.fnClearTable();
		    }
		    dTable.fnAddData(_config.items);
		    dTablesArr.push(dTable);
		    
		    // Setting up table events
		    if (_config.dataTable.sPaginationType) {
                $('#dataTable_'+elCnt+' thead tr,#dataTable_'+elCnt+'_next,#dataTable_'+elCnt+'_previous,#dataTable_'+elCnt+'_first,#dataTable_'+elCnt+'_last').click( function() { _config.fnContentChange(this); if (_config.expandableRows) _expandClick(dTable); } );
                $('#dataTable_0_paginate input').keyup( function() { _config.fnContentChange(this); if (_config.expandableRows) _expandClick(dTable); } );
            }
            if (_config.expandableRows) _expandClick(dTable);
            //_expandInit(dTable);
            elCnt++;
        });
        
        return dTablesArr;
        //return this;
    };
})(jQuery);
