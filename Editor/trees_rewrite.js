class TreeWindow2 extends EditorWindow {
	@MenuItem("Terrain/Tree Builder2")
	static function Init() {
		var window = GetWindow(TreeWindow2);
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
				run(detailArray,treesBool,detailInt, texture);
			}
		}
		
    }
 
	function run(detailArray,treesBool,detailInt, texture) {
		var colormap : Texture2D = texture as Texture2D;
		Undo.RegisterUndo (Terrain.activeTerrain.terrainData, "Trees From Texture");	
			
		var terrain = Terrain.activeTerrain.terrainData;
		terrain.treeInstances = new Array();//Clear Trees

		var w = colormap.width;
		var h = colormap.height;
		var w2 = terrain.size.x;
		var h2 = terrain.size.z;

		var mapColors = colormap.GetPixels();
		var map = new Color[w2 * w2];

		if (w2 != w || h != w) {
			// Resize using nearest-neighbor scaling if texture has no filtering
			if (colormap.filterMode == FilterMode.Point) {
				var dx : float = parseFloat(w)/w2;
				var dy : float = parseFloat(h)/w2;
				for (y = 0; y < w2; y++) {
					if (y%20 == 0) {
						EditorUtility.DisplayProgressBar("Resize", "Calculating texture", Mathf.InverseLerp(0.0, w2, y));
					}
					var thisY = parseInt(dy*y)*w;
					var yw = y*w2;
					for (x = 0; x < w2; x++) {
						map[yw + x] = mapColors[thisY + dx*x];
					}
				}
			}
			// Otherwise resize using bilinear filtering
			else {
				var ratioX = 1.0/(parseFloat(w2)/(w-1));
				var ratioY = 1.0/(parseFloat(w2)/(h-1));
				for (y = 0; y < w2; y++) {
					
					var yy = Mathf.Floor(y*ratioY);
					var y1 = yy*w;
					var y2 = (yy+1)*w;
					yw = y*w2;
					for (x = 0; x < w2; x++) {
						var xx = Mathf.Floor(x*ratioX);
	 
						var bl = mapColors[y1 + xx];
						var br = mapColors[y1 + xx+1]; 
						var tl = mapColors[y2 + xx];
						var tr = mapColors[y2 + xx+1];
	 
						var xLerp = x*ratioX-xx;
						map[yw + x] = Color.Lerp(Color.Lerp(bl, br, xLerp), Color.Lerp(tl, tr, xLerp), y*ratioY-yy);
					}
				}
			}
			EditorUtility.ClearProgressBar();
		}
		else {
			// Use original if no resize is needed
			map = mapColors;
		}

		// Assign texture data to heightmap
		for (y = 0; y < w2; y=y+5) {
			if (y%20 == 0) {
				EditorUtility.DisplayProgressBar("Building", "Adding Trees", Mathf.InverseLerp(0.0, w2, y));
			}
			for (x = 0; x < w2; x=x+5) {
				var searchindex = map[y*w2+x];
				var i = indexOf(detailArray,searchindex);
				if(i != -1 && treesBool[i]==true){
					if(Random.Range(1, 100)<=60){
							var treeInstance = new TreeInstance();
							treeInstance.prototypeIndex = Random.Range(0, 2);//prototype;
							var position = new Vector3(x/w2,0,y/w2);


							treeInstance.position = position;
							treeInstance.color = new Color(0,Random.Range(100, 200),0);
							treeInstance.heightScale = Random.Range(0.5f, 1.0f);
							treeInstance.widthScale = Random.Range(0.5f, 1.0f);

							Terrain.activeTerrain.AddTreeInstance(treeInstance);
			
							print(terrain.treeInstances.Length);
						}
				}
			}
		}
		Terrain.activeTerrain.Flush();
		EditorUtility.ClearProgressBar();
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