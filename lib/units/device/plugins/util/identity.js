var syrup = require('stf-syrup')

var devutil = require('../../../../util/devutil')
var logger = require('../../../../util/logger')

module.exports = syrup.serial()
  .dependency(require('../../support/properties'))
  .dependency(require('./display'))
  .dependency(require('./phone'))
  .define(function(options, properties, display, phone) {
    var log = logger.createLogger('device:plugins:identity')

    function solve() {
      log.info('Solving identity')
      var identity = devutil.makeIdentity(options.serial, properties)
      identity.display = display.properties
      identity.phone = phone

      // Override the ipAddress list
      var ipAddressList = { }
      phone.ipAddress.split(';').forEach(element => {
        var interfaceName = element.split('=')[0]
        if (interfaceName.length > 0) {
          var interfaceAddress = element.split('=')[1]
          if (!(interfaceName in ipAddressList)) {
            ipAddressList[interfaceName] = { }
          }
          if (interfaceAddress.includes('::')) {
            ipAddressList[interfaceName].ipv6 = interfaceAddress
          }
          else {
            ipAddressList[interfaceName].ipv4 = interfaceAddress
          }
        }
      })

      // Only present the wlan address
      if ('wlan0' in ipAddressList) {
        if ('ipv6' in ipAddressList.wlan0) {
          phone.ipAddress = ipAddressList.wlan0.ipv6
        }
        if ('ipv4' in ipAddressList.wlan0) {
          phone.ipAddress = ipAddressList.wlan0.ipv4
        }
      }
      else {
        phone.ipAddress = ''
      }

      return identity
    }

    return solve()
  })
