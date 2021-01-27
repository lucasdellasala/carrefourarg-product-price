import React from 'react'
import { defineMessages, FormattedNumber } from 'react-intl'
import { useProduct } from 'vtex.product-context'
import { FormattedCurrency } from 'vtex.format-currency'
import { useCssHandles } from 'vtex.css-handles'
import { IOMessageWithMarkers } from 'vtex.native-types'

import { getFirstAvailableSeller } from './modules/seller'

const CSS_HANDLES = [
  'listPrice',
  'listPriceValue',
  'listPriceWithTax',
  'taxPercentage',
] as const

const messages = defineMessages({
  title: {
    id: 'admin/list-price.title',
  },
  description: {
    id: 'admin/list-price.description',
  },
  default: {
    id: 'store/list-price.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
}

function ListPrice({ message = messages.default.id, markers = [] }: Props) {
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

  //LOGICA DE PROMO
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
    
    if (discountsList[0].value == discountsList[1].value && discountsList[0].value == discountsList[2].value){
      return discountsList[0].list
    }

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

  const listPriceValue: number = commercialOffer.ListPrice
  const sellingPriceValue = commercialOffer.ListPrice * (1 - getDiscount() / 100)
  const { taxPercentage } = commercialOffer
  const listPriceWithTax = listPriceValue + listPriceValue * taxPercentage

  if (listPriceValue <= sellingPriceValue) {
    return null
  }

  return (
    <span className={handles.listPrice}>
      <IOMessageWithMarkers
        message={message}
        markers={markers}
        handleBase="listPrice"
        values={{
          listPriceValue: (
            <span
              key="listPriceValue"
              className={`${handles.listPriceValue} strike`}
            >
              <FormattedCurrency value={listPriceValue} />
            </span>
          ),
          listPriceWithTax: (
            <span
              key="listPriceWithTax"
              className={`${handles.listPriceWithTax} strike`}
            >
              <FormattedCurrency value={listPriceWithTax} />
            </span>
          ),
          taxPercentage: (
            <span key="taxPercentage" className={handles.taxPercentage}>
              <FormattedNumber value={taxPercentage} style="percent" />
            </span>
          ),
        }}
      />
    </span>
  )
}

ListPrice.schema = {
  title: messages.title.id,
}

export default ListPrice
