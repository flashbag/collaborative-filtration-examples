# collaborative-filtration-examples
Collaborative filtration JS Examples for book "Programming Collective Intelligence"

Running "npm start" will first generate JSON files in data folder, than retrieve two random people and calculate different similarity coefficients

Script output will look like this:

    Two random persons:
 
    [ { person_id: 2, name: 'Amber Boyer' },
      { person_id: 0, name: 'Enola Walker' } ]

    Common scores between persons:
    [ [ { item_id: 1, title: 'indexing', score: 4.704 },
      { item_id: 1, title: 'indexing', score: 3.709 } ],
    [ { item_id: 0, title: 'parsing', score: 3.756 },
      { item_id: 0, title: 'parsing', score: 0.384 } ],
    [ { item_id: 4, title: 'synthesizing', score: 5.699 },
      { item_id: 4, title: 'synthesizing', score: 1.67 } ],
    [ { item_id: 2, title: 'compressing', score: 3.519 },
      { item_id: 2, title: 'compressing', score: 4.394 } ] ]

    Persons similarity coefficients 

	    by euclideanDistance:    0.1558
	    by pearson corelation:  -0.18519
	    by jaccard index: 0.25


    "Amber Boyer" similar people by euclideanDistance: 

	    Juana Gusikowski  	 	 	0.38756
	    Heaven Kris  	 	 	     0.25556
	    Liliana Konopelski  	 	0.21656
	    Missouri Stracke  	 	 	0.20672
	    Enola Walker  	 	 	    0.1558

    "Amber Boyer" similar people by pearson corelation: 

    	Juana Gusikowski          0.73908
	    Liliana Konopelski  	  0.05226
	    Selena Abshire  	 	 -0.05185
	    Heaven Kris  	 	 	   -0.06817
	    Enola Walker  	 	 	  -0.18519
