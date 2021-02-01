import React from 'react'
import { defineMessages, FormattedNumber } from 'react-intl'
import { useProduct } from 'vtex.product-context'
import { FormattedCurrency } from 'vtex.format-currency'
import { useCssHandles } from 'vtex.css-handles'
import { IOMessageWithMarkers } from 'vtex.native-types'
import { ProductSummaryContext } from 'vtex.product-summary-context'

import { getFirstAvailableSeller } from './modules/seller'

const CSS_HANDLES = [
  'savings',
  'previousPriceValue',
  'newPriceValue',
  'savingsValue',
  'savingsWithTax',
  'savingsPercentage',
] as const

const messages = defineMessages({
  title: {
    id: 'admin/savings.title',
  },
  description: {
    id: 'admin/savings.description',
  },
  default: {
    id: 'store/savings.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
}

function Savings({ message = messages.default.id, markers = [] }: Props) {
  const handles = useCssHandles(CSS_HANDLES)
  const productContextValue = useProduct()
  const { product } = useProduct() ?? {}
  const productSummaryValue = ProductSummaryContext.useProductSummary()

  const availableSeller = getFirstAvailableSeller(
    productContextValue?.selectedItem?.sellers
  )

  const commercialOffer = availableSeller?.commertialOffer

  if (
    !commercialOffer ||
    commercialOffer?.AvailableQuantity <= 0 ||
    productSummaryValue?.isLoading
  ) {
    return null
  }

  //LOGICA DE PROMO
  const bestPromotion = () => {
    const teasers = commercialOffer?.teasers
    const discountHighlights = commercialOffer?.discountHighlights
    const clusterHighlights = product?.clusterHighlights
    
    const bestPromoByType = (promotion: any) => {
      if (promotion != undefined){
        if (promotion.length>1){
          let bestPromo;
          for(let i=0; i<promotion.length; i++){
            const promo = promotion[i].name
            
            const splitedPromo = promo.split("-")
            const discount = discountValue(splitedPromo)
            const lastDiscount = discountValue(bestPromo)
            if (discount>=lastDiscount){
              bestPromo = promotion[i]
            }
          }
          return bestPromo.name
        } else if (promotion.length == 1){
          return promotion[0].name
        } else {
          return null
        }
      } else {
        return null
      }
      
    }

    const discountValue = (promotion: any): number => {
      if (promotion == undefined){
        return 0
      }
      if (promotion[0] !== "PROMO") {
        return 0
      }
      const percentaje: any = promotion?.[4]
      const listOfNumbers: any = promotion?.[3]?.toString().split(",")
      const numberOfProducts: number = listOfNumbers?.length

      return numberOfProducts * percentaje
    }

    const teasersList = bestPromoByType(teasers)?.split("-") ?? ""
    const discountHighlightsList =  bestPromoByType(discountHighlights)?.split("-") ?? ""
    const clusterHighlightsList =  bestPromoByType(clusterHighlights)?.split("-") ?? ""
    
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

    if (discountsList[0].value == discountsList[1].value && discountsList[0].value == discountsList[2].value) {
      return discountsList[0].list
    }

    const sortedDiscountsList = discountsList.sort((a, b) => b.value - a.value)

    if (sortedDiscountsList[0].value != 0) {
      return sortedDiscountsList[0].list
    } else {
      return null
    }
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
      const lastProduct = Math.max(...listOfNumbers)

      const discount = 1 - (lastProduct - numberOfProducts * percentaje) / lastProduct

      return discount
    }
  }
  //ACA ES LA LOGICA DEL PRECIO
  const previousPriceValue = commercialOffer.ListPrice
  const newPriceValue = commercialOffer.ListPrice * (1 - getDiscount() / 100)
  const savingsValue = previousPriceValue - newPriceValue
  const savingsWithTax =
    savingsValue + savingsValue * commercialOffer.taxPercentage

  const savingsPercentage = savingsValue / previousPriceValue

  if (savingsValue <= 0) {
    return null
  }

  return (
    <span className={handles.savings}>
      <IOMessageWithMarkers
        message={message}
        markers={markers}
        handleBase="savings"
        values={{
          previousPriceValue: (
            <span
              key="previousPriceValue"
              className={handles.previousPriceValue}
            >
              <FormattedCurrency value={previousPriceValue} />
            </span>
          ),
          newPriceValue: (
            <span key="newPriceValue" className={handles.newPriceValue}>
              <FormattedCurrency value={newPriceValue} />
            </span>
          ),
          savingsValue: (
            <span key="savingsValue" className={handles.savingsValue}>
              <FormattedCurrency value={savingsValue} />
            </span>
          ),
          savingsWithTax: (
            <span key="savingsWithTax" className={handles.savingsWithTax}>
              <FormattedCurrency value={savingsWithTax} />
            </span>
          ),
          savingsPercentage: (
            <span key="savingsPercentage" className={handles.savingsPercentage}>
              <FormattedNumber value={savingsPercentage} style="percent" />
            </span>
          ),
        }}
      />
    </span>
  )
}

Savings.schema = {
  title: messages.title.id,
}

export default Savings
