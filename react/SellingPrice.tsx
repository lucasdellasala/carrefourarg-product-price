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

  const availableSeller = getFirstAvailableSeller(
    productContextValue?.selectedItem?.sellers
  )



  const commercialOffer = availableSeller?.commertialOffer
  if (!commercialOffer || commercialOffer?.AvailableQuantity <= 0) {
    console.log("No hay commercialOffer o la cantidad es menor igual a cero")
    return null
  }
  console.log('%c NAME!!! ', 'background: #222; color: #bada55')
  //console.log(commercialOffer.teasers[0].name)

  const bestPromotion = () => {
    const teasers = commercialOffer?.teasers[0]?.name
    const discountHighlights = commercialOffer?.discountHighlights[1]?.name
    console.log("\n")
    console.log(commercialOffer.Price)
    console.log(teasers)
    console.log(discountHighlights)
    console.log("\n")


    const teasersList = teasers?.split("-")
    const discountHighlightsList = discountHighlights?.split("-")

    const discountValue = (promotion: Array<string>): number => {
      if (promotion == undefined) {
        return 0
      }
      const percentaje: any = promotion?.[4]
      //@ts-ignore
      const listOfNumbers: any = promotion?.[3]?.toString().split(",")
      const numberOfProducts: number = listOfNumbers?.length

      return numberOfProducts * percentaje
    }

    if (discountValue(teasersList) > discountValue(discountHighlightsList)) {
      return teasersList
    } else if (discountValue(teasersList) < discountValue(discountHighlightsList)) {
      return discountHighlightsList
    } else {
      return null
    }
  }

  const getDiscount = () => {
    const promotion = bestPromotion()
    if (!promotion) {
      return 0
    } else {
      const percentaje: any = promotion?.[4]
      const listOfNumbers: any = promotion?.[3]?.toString().split(",")
      const numberOfProducts: number = listOfNumbers?.length
      const lastProduct = Math.max(...listOfNumbers)

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
