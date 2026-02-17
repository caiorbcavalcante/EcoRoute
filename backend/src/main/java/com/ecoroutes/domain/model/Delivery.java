package com.ecoroutes.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Delivery {

    private Long id;
    private Coordinate location;
    private boolean visited;

}
