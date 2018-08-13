class DetailWindow extends EditorWindow {
	@MenuItem("Terrain/Detailbuilder")
	static function Init() {
		var window = GetWindow(DetailWindow);
		window.position = Rect(0,0,400, 600);
		window.Show();
	}
	
	var texture : Texture2D;
	var treesBool = new Array();
	var splatInt = new Array();
	var detailInt = new Array();
	var detailColors = new Array();
	var detailArray = new Array();
	var scrollPos: Vector2;

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
				detailArray = buildColorArray(detailColors);
			}
			var textw = texture.width;
			var texth = texture.height;
			
			var pos = 1;
			
			//scrollPos = GUILayout.BeginScrollView(scrollPos, GUILayout.Width(400), GUILayout.Height(400));
			for(var i = 0; i < detailArray.length;i++){
				GUILayout.BeginVertical(GUILayout.Width(200), GUILayout.Height(80));
				var color = detailArray[i];
				if(splatInt.length <= i){
					splatInt.Add(0);
				}
				if(treesBool.length <= i){
					treesBool.Add(false);
				}
				if(detailInt.length <= i){
					detailInt.Add(0);
				}
				var offset = 30 + (i*60);
				EditorGUI.DrawRect(Rect(3,(30*pos)+30,20,20),new Color(color.r,color.g,color.b));
				EditorGUI.LabelField (Rect(23,(30*pos)+30,180,20),"Color Group "+ i, EditorStyles.label);
				treesBool[i] = EditorGUI.Toggle(Rect(200,(30*pos)+30,200,20),"Trees", treesBool[i]);//Should the trees on this layer be on or off
				detailInt[i]=EditorGUI.IntField (Rect(400,(30*pos)+30,200,20),"Detail Layer", detailInt[i]);
				//detailInt[i]=EditorGUI.IntField (Rect(3,60+offset,200,20),"Detail Layer", detailInt[i]);
				
				pos++;
				GUILayout.EndVertical();
			}
			//GUILayout.EndScrollView();
			
			if(GUI.Button(Rect(3,position.height - 55, position.width-6,20),"Test")) {
				for(var ii=0;ii<treesBool.length;ii++){
					Debug.Log("tree:"+ii+"("+treesBool[ii]+")");
				}
			
				for(var jj=0;jj<detailInt.length;jj++){
					Debug.Log("detail:"+jj+"("+detailInt[jj]+")");
				}
			}
			if(GUI.Button(Rect(3,position.height - 25, position.width-6,20),"Apply")) {
				run(detailColors,detailArray,treesBool,detailInt,textw,texth);
			}
		}
    }
	
	function buildColorArray(detailColors){
		var detailArray : Array = [detailColors[0]];
		for(var i = 1; i < detailColors.length; i++){//Cycle Through the Pixel Array to fill out all the unique Colors.
			var index = detailColors[i];//.r + "" + detailColors[i].g + "" + detailColors[i].b; 
			if(indexOf(detailArray, index) == -1){//If not in Array ADD
				//Debug.Log(i + " not in array " + index);
				/*if((detailColors[i].r == 0 && detailColors[i].g == 0 && detailColors[i].b == 0)||
				(detailColors[i].r == 1 && detailColors[i].g == 0 && detailColors[i].b == 0)||
				(detailColors[i].r == 0 && detailColors[i].g == 1 && detailColors[i].b == 0)||
				(detailColors[i].r == 0 && detailColors[i].g == 0 && detailColors[i].b == 1)||
				(detailColors[i].r == 1 && detailColors[i].g == 1 && detailColors[i].b == 0)||
				(detailColors[i].r == 1 && detailColors[i].g == 0 && detailColors[i].b == 1)||
				(detailColors[i].r == 0 && detailColors[i].g == 1 && detailColors[i].b == 1)||
				(detailColors[i].r == 1 && detailColors[i].g == 1 && detailColors[i].b == 1)
				){*///So that we dont have hundreds of colors we restrict to primes
					detailArray.Add(index);	
				/*}
				else{
					Debug.Log("color not added:" + detailColors[i].r + "," + detailColors[i].g + "," + detailColors[i].b);
				}*/
			}
		}
		return detailArray;
	}
	function indexOf(array, index){
		for(var i = 0; i < array.length; i++){
			if ( array[i].r == index.r && array[i].g == index.g && array[i].b == index.b){
				return i;
			}
		}
		return -1;
	}

	function run(detailColors,detailArray,treesBool,detailInt,textw,texth){
		Undo.RegisterUndo (Terrain.activeTerrain.terrainData, "Environment From Texture");

		var terrainData = Terrain.activeTerrain.terrainData;
		var map =	terrainData.GetDetailLayer(0, 0, terrainData.detailWidth, terrainData.detailHeight, 0);
		//var alphamap =	terrainData.GetAlphamaps(0, 0, terrainData.alphamapWidth, terrainData.alphamapHeight);
		
		var color = 0;
		//for(color = 0; color < detailArray.length; color++){
			for (var y = 0; y < terrainData.detailHeight; y++) {
				for (var x = 0; x < terrainData.detailWidth; x++) {
					map[x,y] = 0;
					//alphamap[y,x,0]=0;
					//alphamap[y,x,splatInt[color]]=0;
				}
			}

		//}
		terrainData.SetDetailLayer(0, 0, 0, map);
		terrainData.SetDetailLayer(0, 0, 1, map);
		terrainData.SetDetailLayer(0, 0, 2, map);
		for(color = 0; color < detailArray.length; color++){
			if(treesBool[color]==true){
				for (var y1 = 0; y1 < terrainData.detailHeight; y1++) {
					for (var x1 = 0; x1 < terrainData.detailWidth; x1++) {
						//Debug.Log((textw*(y1*(texth/terrainData.detailHeight)))+(x1*(textw/terrainData.detailWidth)));
						var searchindex = detailColors[Mathf.RoundToInt((textw*(y1*(texth/terrainData.detailHeight)))+(x1*(textw/terrainData.detailWidth)))];//.r + "" + detailColors[(y1*terrainData.detailWidth) + x1].g + "" + detailColors[(y1*terrainData.detailWidth) + x1].b; 
						//var retIndex = indexOf(detailArray,searchindex);
						//if(searchindex == detailArray[color]){
						if (searchindex.r == detailArray[color].r && searchindex.g == detailArray[color].g && searchindex.b == detailArray[color].b){
							//if(detailArray[color].r == searchindex.r && detailArray[color].g == searchindex.g && detailArray[color].b == searchindex.b){
							//if(retIndex != -1){
								map[y1,x1] = 1;
								//alphamap[y1,x1,splatInt[retIndex]]=1;
							//}
						}
						else{
							map[y1,x1] = 0;
						}
					}
				}
			}
			terrainData.SetDetailLayer(0, 0, detailInt[color], map);
			for (y = 0; y < terrainData.detailHeight; y++) {
				for (x = 0; x < terrainData.detailWidth; x++) {
					map[x,y] = 0;
					//alphamap[y,x,0]=0;
					//alphamap[y,x,splatInt[color]]=0;
				}
			}
		}
		
		//for(color = 0; color < detailArray.length; color++){
		//Debug.Log("color level: " + color);
			
			/*for (var y1 = 0; y1 < terrainData.detailHeight; y1++) {
				for (var x1 = 0; x1 < terrainData.detailWidth; x1++) {
					//Debug.Log((textw*(y1*(texth/terrainData.detailHeight)))+(x1*(textw/terrainData.detailWidth)));
					var searchindex = detailColors[(textw*(y1*(texth/terrainData.detailHeight)))+(x1*(textw/terrainData.detailWidth))];//.r + "" + detailColors[(y1*terrainData.detailWidth) + x1].g + "" + detailColors[(y1*terrainData.detailWidth) + x1].b; 
					var retIndex = indexOf(detailArray,searchindex);
					//if(searchindex == detailArray[color]){
					//if(detailArray[color].r == searchindex.r && detailArray[color].g == searchindex.g && detailArray[color].b == searchindex.b){
					if(retIndex != -1){
					//map[x1,y1] = 1;
						alphamap[x1,y1,splatInt[retIndex]]=1;
					}
				}
			}*/
			//terrainData.SetDetailLayer(0, 0, detailInt[color], map);
		
		//}
		//terrainData.SetAlphamaps(0,0,alphamap);
		Debug.Log("Done");
	}
}