const bestPromotion = (product: any, commercialOffer: any) => {
    const teasers = commercialOffer?.teasers
    const discountHighlights = commercialOffer?.discountHighlights
    const clusterHighlights = product?.clusterHighlights

    const teasersList = bestPromoByType(teasers)?.split("-") ?? ""
    const discountHighlightsList = bestPromoByType(discountHighlights)?.split("-") ?? ""
    const clusterHighlightsList = bestPromoByType(clusterHighlights)?.split("-") ?? ""

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

const bestPromoByType = (promotion: any) => {
    if (promotion != undefined) {
        if (promotion.length > 1) {
            let bestPromo;
            for (let i = 0; i < promotion.length; i++) {
                const promo = promotion[i].name

                const splitedPromo = promo.split("-")
                const discount = discountValue(splitedPromo)
                const lastDiscount = discountValue(bestPromo)
                if (discount >= lastDiscount) {
                    bestPromo = promotion[i]
                }
            }
            return bestPromo.name
        } else if (promotion.length == 1) {
            return promotion[0].name
        } else {
            return null
        }
    } else {
        return null
    }

}

const discountValue = (promotion: any): number => {
    if (promotion == undefined) {
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


export const getDiscount = (product: any, commercialOffer: any) => {
    const promotion = bestPromotion(product, commercialOffer)
    const length = promotion?.length ?? 0

    if (!promotion) {
        return 0
    } else if (length < 4) {
        return 0
    } else {
        const percentaje: any = promotion?.[4]
        const listOfNumbers: any = promotion?.[3]?.toString().split(",")
        const numberOfProducts: number = listOfNumbers?.length
        const sortedList = listOfNumbers.sort((a: number, b: number) => b - a)
        const lastProduct = sortedList[0]

        const discount = 1 - (lastProduct - numberOfProducts * percentaje) / lastProduct

        return discount
    }
}