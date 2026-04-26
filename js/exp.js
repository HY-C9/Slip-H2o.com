(function (window) {
  'use strict';


  function parseDateSafe(value) {
    if (!value) return null;

    var normalized = String(value).trim().replace(' ', 'T');
    var d = new Date(normalized);

    if (isNaN(d.getTime())) {
      return null;
    }
    return d;
  }

  /**
   * @param {string|Date} value
   * @param {Object} opts  
   * @returns {string}
   */
  function formatExpireAt(value, opts) {
    opts = opts || {};
    var d = value instanceof Date ? value : parseDateSafe(value);
    if (!d) return '-';

    // วันที่แบบไทย
    var dateStr = d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (opts.withTime) {
      var timeStr = d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return dateStr + ' ' + timeStr + ' น.';
    }

    return dateStr;
  }

  /**
   * @param {string|Date} value
   * @returns {"expired"|"active"|"none"}
   */
  function getExpireStatus(value) {
    var d = value instanceof Date ? value : parseDateSafe(value);
    if (!d) return 'none';

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (target < today) return 'expired';
    return 'active';
  }

  function renderExpireAt(data, type, row) {
    if (type === 'display' || type === 'filter') {
      var status = getExpireStatus(data);
      var text = formatExpireAt(data);


      if (status === 'expired') {
        return '<span class="badge bg-danger-subtle text-danger">' +
               text +
               '</span>';
      }
      if (status === 'active') {
        return '<span class="badge bg-success-subtle text-success">' +
               text +
               '</span>';
      }
      return '<span class="text-muted">-</span>';
    }

    return data;
  }

  window.expireUtils = {
    parseDateSafe: parseDateSafe,
    formatExpireAt: formatExpireAt,
    getExpireStatus: getExpireStatus,
    renderExpireAt: renderExpireAt
  };
})(window);
