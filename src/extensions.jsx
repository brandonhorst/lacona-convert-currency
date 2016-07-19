/** @jsx createElement */
import { createElement } from 'elliptical'
import { Command, Decimal } from 'lacona-phrases'

import _ from 'lodash'
import fetch from 'node-fetch'
import { setClipboard } from 'lacona-api'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { interval } from 'rxjs/observable/interval'
import { mergeMap } from 'rxjs/operator/mergeMap'
import { concat } from 'rxjs/operator/concat'
import { filter } from 'rxjs/operator/filter'

import currencies from './currencies'

const FIXER_URL = 'http://api.fixer.io/latest'
const BASE_CURRENCY = 'EUR'

function fetchRates () {
  return fetch(FIXER_URL)
    .then(res => res.json())
    .then(body => {
      if (body && body.rates) {
        body.rates[BASE_CURRENCY] = 1
        return body.rates
      }
    })
    .catch(e => console.error(`Error connecting to fixer.io: ${e}`))
}

const CurrencySource = {
  fetch () {
    // return fromPromise(promise)
    return fromPromise(fetchRates())
      ::concat(interval(60 * 60 * 1000)::mergeMap(() => {
        return fromPromise(fetchRates())
      }))
      ::filter(_.identity)
  }
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

function convert (result, rates, defaultCurrency) {
  const toList = result.to || [defaultCurrency]

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
    const rates = observe(<CurrencySource />)
    if (rates) {
      const converted = convert(result, rates, config.currencyConversion.defaultCurrency)
      let output

      if (converted.length === 1) {
        output = `${+converted[0].toAmount.toFixed(2)}${converted[0].to}`
      } else {
        output = _.map(converted, ({from, to, fromAmount, toAmount}) => {
          return `${fromAmount} ${from} = ${+toAmount.toFixed(2)} ${to}`
        }).join('\n')
      }

      setClipboard({text: output})
    }
  },

  preview (result, {observe, config}) {
    const rates = observe(<CurrencySource />)
    if (rates) {
      const converted = convert(result, rates, config.currencyConversion.defaultCurrency)

      const strings = _.map(converted, ({from, to, fromAmount, toAmount}) => {
        return `${fromAmount} ${from} = ${+toAmount.toFixed(2)} ${to}`
      })

      const html = strings.join('<br />')

      return {type: 'html', value: html}
    }
  },

  describe ({observe}) {
    const rates = observe(<CurrencySource />)
    if (rates) {
      return (
        <sequence>
          <list items={['convert ', 'calculate ', 'compute ']} limit={1} />
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
}

export const extensions = [ConvertCurrency]
