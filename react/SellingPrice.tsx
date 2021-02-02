import React from 'react'
import { defineMessages, FormattedNumber } from 'react-intl'
import { useProduct } from 'vtex.product-context'
import { FormattedCurrency } from 'vtex.format-currency'
import { IOMessageWithMarkers } from 'vtex.native-types'
import { useCssHandles, applyModifiers } from 'vtex.css-handles'

import { getFirstAvailableSeller } from './modules/seller'

import { getDiscount } from './utils/utils'

const CSS_HANDLES = [
  'sellingPrice',
  'sellingPriceValue',
  'sellingPriceWithTax',
  'taxPercentage',
] as const

const messages = defineMessages({
  title: {
    id: 'admin/selling-price.title',
  },
  description: {
    id: 'admin/selling-price.description',
  },
  default: {
    id: 'store/selling-price.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
}

function SellingPrice({ message = messages.default.id, markers = [] }: Props) {
  const handles = useCssHandles(CSS_HANDLES)
  const productContextValue = useProduct()
  const { product } = useProduct() ?? {}

  const availableSeller = getFirstAvailableSeller(
    productContextValue?.selectedItem?.sellers
  )

  const commercialOffer = availableSeller?.commertialOffer
  if (!commercialOffer || commercialOffer?.AvailableQuantity <= 0) {
    return null
  }

  //Here's the custom promotion logic
  const sellingPriceValue: number = commercialOffer.ListPrice * (1 - getDiscount(product, commercialOffer) / 100)
  const listPriceValue = commercialOffer.ListPrice
  const { taxPercentage } = commercialOffer
  const sellingPriceWithTax =
    sellingPriceValue + sellingPriceValue * taxPercentage

  const hasListPrice = sellingPriceValue !== listPriceValue

  const containerClasses = applyModifiers(
    handles.sellingPrice,
    hasListPrice ? 'hasListPrice' : ''
  )

  return (
    <span className={containerClasses}>
      <IOMessageWithMarkers
        message={message}
        markers={markers}
        handleBase="sellingPrice"
        values={{
          sellingPriceValue: (
            <span key="sellingPriceValue" className={handles.sellingPriceValue}>
              <FormattedCurrency value={sellingPriceValue} />
            </span>
          ),
          sellingPriceWithTax: (
            <span
              key="sellingPriceWithTax"
              className={handles.sellingPriceWithTax}
            >
              <FormattedCurrency value={sellingPriceWithTax} />
            </span>
          ),
          taxPercentage: (
            <span key="taxPercentage" className={handles.taxPercentage}>
              <FormattedNumber value={taxPercentage} style="percent" />
            </span>
          ),
          hasListPrice,
        }}
      />
    </span>
  )
}

SellingPrice.schema = {
  title: messages.title.id,
}

export default SellingPrice
