class TreeWindow extends EditorWindow {
	@MenuItem("Terrain/Tree Builder")
	static function Init() {
		var window = GetWindow(TreeWindow);
		window.position = Rect(0,0,600, 500);
		window.Show();
	}
	
	var texture : Texture2D;
	var treesBool = new Array();
	var detailInt = new Array();
	var detailColors = new Array();
	var detailArray = new Array();

    function OnGUI () {

		EditorGUILayout.BeginHorizontal();
        texture = EditorGUI.ObjectField(Rect(3,15,200,40),
                "Add a Texture:",
                texture,
                Texture2D);
		EditorGUILayout.EndHorizontal();
		if(texture){
			if(detailColors.length < 1){
				detailColors = texture.GetPixels();
				detailArray = findColors(detailColors);
			}
			var textw = texture.width;
			var texth = texture.height;
				
			var pos = 1;
			for(var i = 0; i < detailArray.length;i++){
				var color = detailArray[i];
				if(treesBool.length >= i){
					treesBool.Add(false);
				}
				if(detailInt.length >= i){
					detailInt.Add(0);
				}
				EditorGUI.DrawRect(Rect(3,(30*pos)+30,20,20),new Color(color.r,color.g,color.b));
				EditorGUI.LabelField (Rect(23,(30*pos)+30,180,20),"Color Group "+ i, EditorStyles.label);
				treesBool[i] = EditorGUI.Toggle(Rect(200,(30*pos)+30,200,20),"Trees", treesBool[i]);//Should the trees on this layer be on or off
				detailInt[i]=EditorGUI.IntField(Rect(400,(30*pos)+30,200,20),"Tree Type", detailInt[i]);// Which tree type should go here
				pos++;
			}
			if(GUI.Button(Rect(3,position.height - 55, position.width-6,20),"Test")) {
				for(var ii=0;ii<treesBool.length;ii++){
					Debug.Log("splat:"+ii+"("+treesBool[ii]+")");
				}
				for(var jj=0;jj<detailInt.length;jj++){
					Debug.Log("detail:"+jj+"("+detailInt[jj]+")");
				}
			}
			if(GUI.Button(Rect(3,position.height - 25, position.width-6,20),"Apply")) {
				run(detailColors,detailArray,treesBool,detailInt, textw,texth);
			}
		}
		
    }
 
	function run(detailColors,detailArray,treesBool,detailInt, textw,texth) {

		Undo.RegisterUndo (Terrain.activeTerrain.terrainData, "Trees From Texture");
		
		var terrain = Terrain.activeTerrain.terrainData;
		terrain.treeInstances = new Array();
		var w2 = terrain.size.x;
		var h2 = terrain.size.z;
		var treemapData = terrain.GetHeights(0, 0, terrain.heightmapWidth, terrain.heightmapWidth);
		var randMap = new Array();
 
		var ih = 0;
		var iw = 0;
		var distance = Random.Range(3, 10);
	
		/*for(ih = 0; ih < h2; ih++){
			for(iw = 0; iw < w2; iw++){
				if(nearestNeighbor(iw,ih,distance,w2,h2,randMap) == false){//If False there is no tree within 'distance' of this location so we add a tree.
					randMap[w2*ih + iw] = 1;
					distance = Random.Range(3, 10);
					Debug.Log(distance);
				}
				else{//Other Trees are too close so we do not put a tree.
					randMap[w2*ih + iw] = 0;
				}
			}
		}*/

		//for(var i =0; i < detailArray.length;i++){//Cycle Through Colors
			//if(treesBool[i]==true){//This Color should have trees.
				//var layerColor = detailArray[i];
				var count=0;
				for(ih = 0; ih < h2; ih=ih+5){
					for(iw = 0; iw < w2; iw=iw+5){
							var dci = Mathf.RoundToInt(textw*(ih*(texth/h2))+(iw*(textw/w2)));
							//var dci = texth*ih+iw;//h2*ih+iw;
							var i = -1;
							if(dci < detailColors.length){
								var searchindex = detailColors[dci];//.r + "" + detailColors[(y1*terrainData.detailWidth) + x1].g + "" + detailColors[(y1*terrainData.detailWidth) + x1].b; 
								i = indexOf(detailArray,searchindex);
							}
							//Debug.Log("Pos("+iw+","+ih+") ["+dci+"] at index: "+ i);
							if(i != -1 && i<treesBool.length){
								if(treesBool[i]==true){
									Debug.Log("Bool("+treesBool[i]+") at index: "+ i + " : " + detailColors[dci].r + "," + detailColors[dci].g +","+ detailColors[dci].b);
									//var prototype = detailInt[i];
									if(Random.Range(1, 100)<=60){
									//if(randMap[w2*ih + iw]==1){//Check to see if one of our random trees is in this location, if so add it to the terrain.
										//var elev = treemapData[(iw*(terrain.heightmapWidth/w2)),(ih*(terrain.heightmapWidth/h2))];
										var treeInstance = new TreeInstance();
										treeInstance.prototypeIndex = Random.Range(0, 2);//prototype;
										var posx = iw;
										var posz = ih;
										//var position = new Vector3(((1.0f/w2)*iw),((1.0f/w2)*elev),((1.0f/h2)*ih));
										//var position = new Vector3(((1.0f/w2)*iw),0,((1.0f/h2)*ih));
										var position = new Vector3(((1.0f/w2)*(iw*(textw/w2))),0,((1.0f/h2)*(ih*(texth/h2))));//(((1.0f/w2)*iw),0,((1.0f/h2)*ih));

										//Debug.Log("At  Tree: " + ((1.0f/w2)*iw) +","+ ((1.0f/w2)*elev) +","+ ((1.0f/h2)*ih));
			        

										treeInstance.position = position;
										treeInstance.color = new Color(0,Random.Range(100, 200),0);
										treeInstance.heightScale = Random.Range(0.5f, 1.0f);
										treeInstance.widthScale = Random.Range(0.5f, 1.0f);
		    
										Terrain.activeTerrain.AddTreeInstance(treeInstance);
						
										//Debug.Log("Tree: " + terrain.treeInstances.Length);
										print(terrain.treeInstances.Length);
									}
								}
							}
						
					}
				}
			//}
		//}
		Terrain.activeTerrain.Flush();
		Debug.Log("End Trees");
	}

	function nearestNeighbor(x,y,d,w,h,array){
		var minx = x-d;
		if(minx < 0)minx=0;
		var maxx = x+d;
		if(maxx > w)maxx=w;
		var miny = y-d;
		if(miny < 0)miny=0;
		var maxy = y;//Seeing as we working down a grid there should never be a higher Y than the current value.
		if(maxy > h)maxy=h;

		for(var i = minx; i <= maxx; i++){
			for(var j = miny; j <= maxy; j++){
				if(w*j+i < array.length){//Ensure its not out of bounds
					if(array[w*j+i] == 1){
						return true;
					}
				}
			}
		}
		return false;
	}

	function findColors(detailColors){
		var detailArray : Array = [detailColors[0]];
		for(var i = 1; i < detailColors.length; i++){//Cycle Through the Pixel Array to fill out all the unique Colors.
			var index = detailColors[i];
			if(indexOf(detailArray, index) == -1){//If not in Array ADD
				detailArray.Add(index);	
			}
		}
		return detailArray;
	}

	/*function indexOf(array, index){
		for(var i = 0; i < array.length; i++){
			if ( array[i] == index){
				return i;
			}
		}
		return -1;
	}*/
	function indexOf(array, index){
		for(var i = 0; i < array.length; i++){
			if ( array[i].r == index.r && array[i].g == index.g && array[i].b == index.b){
				return i;
			}
		}
		return -1;
	}
}