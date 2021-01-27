import React from 'react'
import { defineMessages, FormattedNumber } from 'react-intl'
import { useProduct } from 'vtex.product-context'
import { FormattedCurrency } from 'vtex.format-currency'
import { IOMessageWithMarkers } from 'vtex.native-types'
import { useCssHandles, applyModifiers } from 'vtex.css-handles'

import { getFirstAvailableSeller } from './modules/seller'

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

  const bestPromotion = () => {
    const teasers = commercialOffer?.teasers[0]?.name
    const discountHighlights = commercialOffer?.discountHighlights[0]?.name
    const clusterHighlights = product?.clusterHighlights[0]?.name
    
    const teasersList = teasers?.split("-")
    const discountHighlightsList = discountHighlights?.split("-")
    const clusterHighlightsList = clusterHighlights?.split("-")

    const discountValue = (promotion: any ): number => {
      if (promotion == undefined) {
        return 0
      } else if (promotion?.length < 5){
        return 0
      }

      const percentaje: any = promotion?.[4]
      const listOfNumbers: any = promotion?.[3]?.toString().split(",")
      const numberOfProducts: number = listOfNumbers?.length

      return numberOfProducts * percentaje
    }

    const discountsList = [
      {
        value: discountValue(teasersList),
        list: teasersList
      },
      {
        value: discountValue(discountHighlightsList),
        list: discountHighlightsList
      },
      {
        value: discountValue(clusterHighlightsList),
        list: clusterHighlightsList
      }
    ]

    const sortedDiscountsList = discountsList.sort((a, b) => b.value - a.value)

    return sortedDiscountsList[0].list
  }

  const getDiscount = () => {
    const promotion = bestPromotion()
    const length = promotion?.length ?? 0

    if (!promotion) {
      return 0
    } else if (length < 4) {
      return 0
    } else {
      const percentaje: any = promotion?.[4]
      const listOfNumbers: any = promotion?.[3]?.toString().split(",")
      const numberOfProducts: number = listOfNumbers?.length
      const sortedList = listOfNumbers.sort((a: number,b: number) => b - a)
      const lastProduct = sortedList[0]

      const discount = 1 - (lastProduct - numberOfProducts * percentaje) / lastProduct

      return discount
    }
  }

  //ACA ES LA LOGICA DEL PRECIO
  const sellingPriceValue: number = commercialOffer.ListPrice * (1 - getDiscount() / 100)
  const listPriceValue = commercialOffer.ListPrice
  const { taxPercentage } = commercialOffer
  const sellingPriceWithTax =
    sellingPriceValue + sellingPriceValue * taxPercentage

  const hasListPrice = sellingPriceValue !== listPriceValue

  const containerClasses = applyModifiers(
    handles.sellingPrice,
    hasListPrice ? 'hasListPrice' : ''
  )
  //ESTAS SON LAS VARIABLES QUE SE RENDERIZAN
  //sellingPriceValue, sellingPriceWithTax, taxPercentaje

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
