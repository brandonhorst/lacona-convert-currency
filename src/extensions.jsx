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
      'Dollar'
    ],
    qualifiers: ['Australia'],
    annotations: [{type: 'text', value: '🇦🇺'}]
  },
  'BGN': {
    singular: [
      'Bulgarian Lev',
      'Bulgaria Lev',
      'Lev'
    ],
    annotations: [{type: 'text', value: '🇧🇬'}]
  },
  'BRL': {
    singular: [
      'Brazilian Real',
      'Brazil Real',
      'Real'
    ],
    annotations: [{type: 'text', value: '🇧🇷'}]
  },
  'CAD': {
    singular: [
      'Canadian Dollar',
      'Canada Dollar',
      'Dollar'
    ],
    qualifiers: ['Canada'],
    annotations: [{type: 'text', value: '🇨🇦'}]
  },
  'CHF': {
    singular: [
      'Swiss Franc',
      'Switzerland Franc',
      'Franc'
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
      '¥'
    ],
    qualifiers: ['China'],
    annotations: [{type: 'text', value: '🇨🇳'}]
  },
  'CZK': {
    singular: [
      'Czech Republic Koruna',
      'Czech Koruna',
      'Koruna'
    ],
    annotations: [{type: 'text', value: '🇨🇿'}]
  },
  'DKK': {
    singular: [
      'Danish Krone',
      'Denmark Krone',
      'Krone'
    ],
    qualifiers: ['Denmark'],
    annotations: [{type: 'text', value: '🇩🇰'}]
  },
  'EUR': {
    singular: [
      'Euro'
    ],
    annotations: [{type: 'text', value: '🇪🇺'}]
  },
  'GBP': {
    singular: [
      'British Pound',
      'UK Pound',
      'United Kingdom Pound',
      'Great Britain Pound',
      'Pound',
      'Pound Sterling',
      '£'
    ],
    annotations: [{type: 'text', value: '🇬🇧'}]
  },
  'HKD': {
    singular: [
      'Hong Kong Dollar',
      'Dollar'
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
    annotations: [{type: 'text', value: '🇭🇷'}]
  },
  'HUF': {
    singular: [
      'Hungarian Forint',
      'Hungary Forint',
      'Forint'
    ],
    annotations: [{type: 'text', value: '🇭🇺'}]
  },
  'IDR': {
    singular: [
      'Indonesian Rupiah',
      'Indonesia Rupiah',
      'Rupiah'
    ],
    annotations: [{type: 'text', value: '🇮🇩'}]
  },
  'ILS': {
    singular: [
      'Israeli New Sheqel',
      'Israeli Sheqel',
      'Israel New Sheqel',
      'Israel Sheqel',
      'New Sheqel',
      'Sheqel'
    ],
    annotations: [{type: 'text', value: '🇮🇱'}]
  },
  'INR': {
    singular: [
      'Indian Rupee',
      'Rupee'
    ],
    annotations: [{type: 'text', value: '🇮🇳'}]
  },
  'JPY': {
    singular: [
      'Japanese Yen',
      'Yen',
      '¥'
    ],
    qualifiers: ['Japan'],
    annotations: [{type: 'text', value: '🇯🇵'}]
  },
  'KRW': {
    singular: [
      'South Korean Won',
      'Korean Won',
      'Won'
    ],
    annotations: [{type: 'text', value: '🇰🇷'}]
  },
  'MXN': {
    singular: [
      'Mexican Peso',
      'Peso'
    ],
    qualifiers: ['Mexico'],
    annotations: [{type: 'text', value: '🇲🇽'}]
  },
  'MYR': {
    singular: [
      'Malaysian Ringgit',
      'Malaysia Ringgit',
      'Malay Ringgit',
      'Ringgit'
    ],
    annotations: [{type: 'text', value: '🇲🇾'}]
  },
  'NOK': {
    singular: [
      'Norwegian Krone',
      'Norway Krone',
      'Krone'
    ],
    qualifiers: ['Norway'],
    annotations: [{type: 'text', value: '🇳🇴'}]
  },
  'NZD': {
    singular: [
      'New Zealand Dollar',
      'Dollar'
    ],
    qualifiers: ['New Zealand'],
    annotations: [{type: 'text', value: '🇳🇿'}]
  },
  'PHP': {
    singular: [
      'Philippine Peso',
      'Philippines Peso',
      'Peso'
    ],
    qualifiers: ['Philippines'],
    annotations: [{type: 'text', value: '🇵🇭'}]
  },
  'PLN': {
    singular: [
      'Polish Zloty',
      'Poland Zloty',
      'Zloty'
    ],
    annotations: [{type: 'text', value: '🇵🇱'}]
  },
  'RON': {
    singular: [
      'Romanian Leu',
      'Romania Leu',
      'Leu'
    ],
    annotations: [{type: 'text', value: '🇷🇴'}]
  },
  'RUB': {
    singular: [
      'Russian Ruble',
      'Russia Ruble',
      'Ruble'
    ],
    annotations: [{type: 'text', value: '🇷🇺'}]
  },
  'SEK': {
    singular: [
      'Swedish Krona',
      'Sweden Krona',
      'Krona'
    ],
    annotations: [{type: 'text', value: '🇸🇪'}]
  },
  'SGD': {
    singular: [
      'Singapore Dollar',
      'Dollar'
    ],
    qualifiers: ['Singapore'],
    annotations: [{type: 'text', value: '🇸🇬'}]
  },
  'THB': {
    singular: [
      'Thai Baht',
      'Thailand Baht',
      'Baht'
    ],
    annotations: [{type: 'text', value: '🇹🇭'}]
  },
  'TRY': {
    singular: [
      'Turkish Lira',
      'Turkey Lira',
      'Lira'
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
      '$'
    ],
    qualifiers: ['United States'],
    annotations: [{type: 'text', value: '🇺🇸'}]
  },
  'ZAR': {
    singular: [
      'South African Rand',
      'African Rand',
      'Rand'
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
    const currencyLists = _.map(currencies, ({singular, qualifiers, annotations}, code) => {
      return <list
        limit={1}
        items={singular.concat(code)}
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
        return `${fromAmount} ${from} = ${toAmount} ${to}`
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
