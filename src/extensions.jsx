/** @jsx createElement */
import { createElement } from 'elliptical'
import { Command, Decimal } from 'lacona-phrases'
import _ from 'lodash'
import fetch from 'node-fetch'
import { setClipboard } from 'lacona-api'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { startWith } from 'rxjs/operator/startWith'

const FIXER_URL = 'http://api.fixer.io/latest'
const BASE_CURRENCY = 'EUR'

const currencies = 
{
  'AUD': {
    singular: [
      'Australian Dollar',
      'Australia Dollar',
      'Dollar',
      'A$',
      '$'
    ],
    plural: [
      'Australian Dollars',
      'Australia Dollars',
      'Dollars'
    ],
    qualifiers: ['Australia'],
    annotations: [{type: 'text', value: '🇦🇺'}]
  },
  'BGN': {
    singular: [
      'Bulgarian Lev',
      'Bulgaria Lev',
      'Lev',
      'лв'
    ],
    plural: [
      'Bulgarian Levove',
      'Bulgarian Leva',
      'Bulgaria Levove',
      'Bulgaria Leva',
      'Levove',
      'Leva'
    ],
    annotations: [{type: 'text', value: '🇧🇬'}]
  },
  'BRL': {
    singular: [
      'Brazilian Real',
      'Brazil Real',
      'Real',
      'R$',
      'BR$'
    ],
    plural: [
      'Brazilian Reais',
      'Brazil Reais',
      'Reais'
    ],
    annotations: [{type: 'text', value: '🇧🇷'}]
  },
  'CAD': {
    singular: [
      'Canadian Dollar',
      'Canada Dollar',
      'Dollar',
      'CA$',
      '$'
    ],
    plural: [
      'Canadian Dollars',
      'Canada Dollars',
      'Dollars'
    ],
    qualifiers: ['Canada'],
    annotations: [{type: 'text', value: '🇨🇦'}]
  },
  'CHF': {
    singular: [
      'Swiss Franc',
      'Switzerland Franc',
      'Franc',
      'Fr'
    ],
    singular: [
      'Swiss Francs',
      'Swiss Franken',
      'Swiss Franchi',
      'Switzerland Francs',
      'Switzerland Franken',
      'Switzerland Franchi',
      'Francs',
      'Franken',
      'Franchi'
    ],
    annotations: [{type: 'text', value: '🇨🇭'}]
  },
  'CNY': {
    singular: [
      'Chinese Yuan',
      'China Yuan',
      'Yuan',
      'Chinese Renminbi',
      'China Renminbi',
      'Renminbi',
      'RMB',
      'CN¥',
      'CNH',
      '¥'
    ],
    qualifiers: ['China'],
    annotations: [{type: 'text', value: '🇨🇳'}]
  },
  'CZK': {
    singular: [
      'Czech Republic Koruna',
      'Czech Koruna',
      'Koruna',
      'Kč'
    ],
    plural: [
      'Czech Republic Korunas',
      'Czech Korunas',
      'Korunas',
    ],
    annotations: [{type: 'text', value: '🇨🇿'}]
  },
  'DKK': {
    singular: [
      'Danish Krone',
      'Denmark Krone',
      'Krone',
      'kr'
    ],
    plural: [
      'Danish Kroner',
      'Denmark Kroner',
      'Kroner'
    ],
    qualifiers: ['Denmark'],
    annotations: [{type: 'text', value: '🇩🇰'}]
  },
  'EUR': {
    singular: [
      'Euro',
      '€'
    ],
    plural: [
      'Euros',
      '€'
    ],
    annotations: [{type: 'text', value: '🇪🇺'}]
  },
  'GBP': {
    singular: [
      'Pound Sterling',
      'British Pound',
      'British Pound Sterling',
      'UK Pound',
      'UK Pound Sterling',
      'United Kingdom Pound',
      'United Kingdom Pound Sterling',
      'Great Britain Pound',
      'Great Britain Pound Sterling',
      'Pound',
      '£'
    ],
    plural: [
      'Pounds Sterling',
      'British Pounds',
      'British Pounds Sterling',
      'UK Pounds',
      'UK Pounds Sterling',
      'United Kingdom Pounds',
      'United Kingdom Pounds Sterling',
      'Great Britain Pounds',
      'Great Britain Pounds Sterling',
      'Pounds',
      '£'
    ],
    annotations: [{type: 'text', value: '🇬🇧'}]
  },
  'HKD': {
    singular: [
      'Hong Kong Dollar',
      'Dollar',
      'HK$',
      '$'
    ],
    plural: [
      'Hong Kong Dollars',
      'Dollars'
    ],
    qualifiers: ['Hong Kong'],
    annotations: [{type: 'text', value: '🇭🇰'}]
  },
  'HRK': {
    singular: [
      'Croatian Kuna',
      'Croatia Kuna',
      'Kuna'
    ],
    plural: [
      'Croatian Kunas',
      'Croatia Kunas',
      'Kunas',
      'kn'
    ],
    annotations: [{type: 'text', value: '🇭🇷'}]
  },
  'HUF': {
    singular: [
      'Hungarian Forint',
      'Hungary Forint',
      'Forint',
      'Ft'
    ],
    plural: [],
    annotations: [{type: 'text', value: '🇭🇺'}]
  },
  'IDR': {
    singular: [
      'Indonesian Rupiah',
      'Indonesia Rupiah',
      'Rupiah',
      'Rp'
    ],
    plural: [],
    qualifiers: ['Indonesia'],
    annotations: [{type: 'text', value: '🇮🇩'}]
  },
  'ILS': {
    singular: [
      'Israeli New Shekel',
      'Israeli Shekel',
      'Israeli Sheqel',
      'Israel New Shekel',
      'Israel Shekel',
      'Israel Sheqel',
      'New Shekel',
      'Shekel',
      'Sheqel',
      '₪'
    ],
    plural: [
      'Israeli New Shekels',
      'Israeli Shekels',
      'Israeli Sheqels',
      'Israel New Shekels',
      'Israel Shekels',
      'Israel Sheqels',
      'New Shekels',
      'Shekels',
      'Sheqels',
      'Israeli Sheqaim',
      'Israel Sheqalim',
      'Sheqalim'
    ],
    annotations: [{type: 'text', value: '🇮🇱'}]
  },
  'INR': {
    singular: [
      'Indian Rupee',
      'Rupee',
      '₹',
      'Rs'
    ],
    plural: [
      'Indian Rupees',
      'Rupees'
    ],
    annotations: [{type: 'text', value: '🇮🇳'}]
  },
  'JPY': {
    singular: [
      'Japanese Yen',
      'Yen',
      '¥'
    ],
    plural: [],
    qualifiers: ['Japan'],
    annotations: [{type: 'text', value: '🇯🇵'}]
  },
  'KRW': {
    singular: [
      'South Korean Won',
      'Korean Won',
      'Won',
      '₩'
    ],
    plural: [],
    annotations: [{type: 'text', value: '🇰🇷'}]
  },
  'MXN': {
    singular: [
      'Mexican Peso',
      'Peso',
      'Mex$',
      '$'
    ],
    plural: [
      'Mexican Pesos',
      'Pesos'
    ],
    qualifiers: ['Mexico'],
    annotations: [{type: 'text', value: '🇲🇽'}]
  },
  'MYR': {
    singular: [
      'Malaysian Ringgit',
      'Malaysia Ringgit',
      'Malay Ringgit',
      'Ringgit',
      'RM'
    ],
    plural: [
      'Malaysian Ringgits',
      'Malaysia Ringgits',
      'Malay Ringgits',
      'Ringgits'
    ],
    annotations: [{type: 'text', value: '🇲🇾'}]
  },
  'NOK': {
    singular: [
      'Norwegian Krone',
      'Norway Krone',
      'Krone',
      'kr'
    ],
    plural: [
      'Norwegian Kroner',
      'Norway Kroner',
      'Kroner'
    ],
    qualifiers: ['Norway'],
    annotations: [{type: 'text', value: '🇳🇴'}]
  },
  'NZD': {
    singular: [
      'New Zealand Dollar',
      'Dollar',
      'NZ$',
      '$',
      'Kiwi',
    ],
    plural: [
      'New Zealand Dollars',
      'Dollars'
    ],
    qualifiers: ['New Zealand'],
    annotations: [{type: 'text', value: '🇳🇿'}]
  },
  'PHP': {
    singular: [
      'Philippine Peso',
      'Philippines Peso',
      'Peso',
      '₱'
    ],
    plural: [
      'Philippine Pesos',
      'Philippines Pesos',
      'Pesos'
    ],
    qualifiers: ['Philippines'],
    annotations: [{type: 'text', value: '🇵🇭'}]
  },
  'PLN': {
    singular: [
      'Polish Zloty',
      'Poland Zloty',
      'Zloty',
      'zł'
    ],
    plural: [],
    annotations: [{type: 'text', value: '🇵🇱'}]
  },
  'RON': {
    singular: [
      'Romanian Leu',
      'Romania Leu',
      'Leu'
    ],
    plural: [
      'Romanian Lei',
      'Romania Lei',
      'Lei'
    ],
    annotations: [{type: 'text', value: '🇷🇴'}]
  },
  'RUB': {
    singular: [
      'Russian Ruble',
      'Russia Ruble',
      'Ruble',
      '₽'
    ],
    plural: [
      'Russian Rubles',
      'Russia Rubles',
      'Rubles'
    ],
    qualifiers: ['Russia'],
    annotations: [{type: 'text', value: '🇷🇺'}]
  },
  'SEK': {
    singular: [
      'Swedish Krona',
      'Sweden Krona',
      'Krona',
      'kr'
    ],
    singular: [
      'Swedish Kronor',
      'Sweden Kronor',
      'Kronor'
    ],
    qualifiers: ['Sweden'],
    annotations: [{type: 'text', value: '🇸🇪'}]
  },
  'SGD': {
    singular: [
      'Singapore Dollar',
      'Dollar',
      'S$',
      '$'
    ],
    plural: [
      'Singapore Dollars',
      'Dollars'
    ],
    qualifiers: ['Singapore'],
    annotations: [{type: 'text', value: '🇸🇬'}]
  },
  'THB': {
    singular: [
      'Thai Baht',
      'Thailand Baht',
      'Baht',
      '฿'
    ],
    plural: [
      'Thai Bahts',
      'Thailand Bahts',
      'Bahts'
    ],
    annotations: [{type: 'text', value: '🇹🇭'}]
  },
  'TRY': {
    singular: [
      'Turkish Lira',
      'Turkey Lira',
      'Lira',
      '₺'
    ],
    plural: [
      'Turkish Liras',
      'Turkey Liras',
      'Liras'
    ],
    annotations: [{type: 'text', value: '🇹🇷'}]
  },
  'USD': {
    singular: [
      'United States Dollar',
      'US Dollar',
      'USA Dollar',
      'Dollar',
      'United States of America Dollar',
      'United States of American Dollar',
      'American Dollar',
      '$',
      'buck'
    ],
    plural: [
      'United States Dollars',
      'US Dollars',
      'USA Dollars',
      'Dollars',
      'United States of America Dollars',
      'United States of American Dollars',
      'American Dollars',
      'bucks'
    ],
    qualifiers: ['United States'],
    annotations: [{type: 'text', value: '🇺🇸'}]
  },
  'ZAR': {
    singular: [
      'South African Rand',
      'African Rand',
      'Rand',
      'R'
    ],
    plural: [
      'South African Rands',
      'African Rands',
      'Rands'
    ],
    annotations: [{type: 'text', value: '🇿🇦'}]
  }
}

const CurrencySource = {
  fetch () {
    const promise = fetch(FIXER_URL)
    .then(res => res.json())
    .then(body => {
      if (body && body.rates) {
        body.rates[BASE_CURRENCY] = 1
        return body.rates
      } else {
        return {}
      }
    })

    return fromPromise(promise)::startWith({})
  },
  clear: true
}

const Currency = {
  describe () {
    const currencyLists = _.map(currencies, ({singular, plural, qualifiers, annotations}, code) => {
      return <list
        limit={1}
        items={singular.concat(plural || [], code)}
        qualifiers={qualifiers}
        annotations={annotations}
        value={code} />
    })

    return (
      <placeholder argument='currency'>
        <choice>{currencyLists}</choice>
      </placeholder>
    )
  }
}

function convert (result, {observe, config}) {
  const rates = observe(<CurrencySource />)
  const toList = result.to || [config.currencyConversion.defaultCurrency]

  const output = _.map(toList, to => {
    const inBase = result.amount / rates[result.from]
    const inTo = inBase * rates[to]
    return {from: result.from, to, fromAmount: result.amount, toAmount: inTo}
  })

  return output
}

export const ConvertCurrency = {
  extends: [Command],

  execute (result, {observe, config}) {
    const converted = convert(result, {observe, config})
    let output

    if (converted.length === 1) {
      output = `${converted[0].toAmount}${converted[0].to}`
    } else {
      output = _.map(converted, ({from, to, fromAmount, toAmount}) => {
        return `${fromAmount} ${from} = ${+toAmount.toFixed(2)} ${to}`
      }).join('\n')
    }

    setClipboard({text: output})
  },

  preview (result, {observe, config}) {
    const converted = convert(result, {observe, config})

    const strings = _.map(converted, ({from, to, fromAmount, toAmount}) => {
      return `${fromAmount} ${from} = ${+toAmount.toFixed(2)} ${to}`
    })

    const html = strings.join('<br />')

    return {type: 'html', value: html}
  },

  describe () {
    return (
      <sequence>
        <list items={['convert ', 'calculate ', 'compute']} limit={1} />
        <placeholder label='currency conversion' merge>
          <sequence>
            <Decimal id='amount' argument='amount' />
            <literal text=' ' optional limited preferred />
            <Currency id='from' ellipsis />
            <list items={[' to ', ' in ']} limit={1} />
            <repeat separator={<list items={[' and ', ', ', ', and ']} limit={1} />} id='to'>
              <Currency />
            </repeat>
          </sequence>
        </placeholder>
      </sequence>
    )
  }
}

export const extensions = [ConvertCurrency]
