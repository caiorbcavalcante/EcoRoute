package com.ecoroutes.exceptions;

public class DeliveryNotFoundException extends BusinessException {
    public DeliveryNotFoundException(Long id){
        super("Delivery with id" + " not found.");
    }
}
