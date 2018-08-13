class DetailWindow2 extends EditorWindow {
	@MenuItem("Terrain/Detailbuilder2")
	static function Init() {
		var window = GetWindow(DetailWindow2);
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
				run(detailArray,treesBool,detailInt,texture);
			}
		}
    }
	
	function buildColorArray(detailColors){
		var detailArray : Array = [detailColors[0]];
		for(var i = 1; i < detailColors.length; i++){
			var index = detailColors[i];
			if(indexOf(detailArray, index) == -1){
					detailArray.Add(index);	
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

	function run(detailArray,treesBool,detailInt, texture) {
		var colormap : Texture2D = texture as Texture2D;
		Undo.RegisterUndo (Terrain.activeTerrain.terrainData, "Trees From Texture");	
			
		var terrain = Terrain.activeTerrain.terrainData;

		var w = colormap.width;
		var h = colormap.height;
		var w2 = terrain.detailWidth;
		var h2 = terrain.detailHeight;
		var map = resize(w,h,w2,h2,colormap);

		//var detailmap =	terrain.GetDetailLayer(0, 0, terrain.detailWidth, terrain.detailHeight, 0);
		
		//var color = 0;
			//for (var y = 0; y < terrain.detailHeight; y++) {
				//for (var x = 0; x < terrain.detailWidth; x++) {
				//	detailmap[x,y] = 0;

				//}
			//}
		//terrain.SetDetailLayer(0, 0, 0, detailmap);
		//terrain.SetDetailLayer(0, 0, 1, detailmap);
		//terrain.SetDetailLayer(0, 0, 2, detailmap);
		for(color = 0; color < detailArray.length; color++){
			var detailmap =	terrain.GetDetailLayer(0, 0, terrain.detailWidth, terrain.detailHeight, detailInt[color]);
			if(treesBool[color]==true){
				for (y = 0; y < w2; y++) {
					if (y%20 == 0) {
						EditorUtility.DisplayProgressBar("Building", "Adding Details for Color " + color, Mathf.InverseLerp(0.0, w2, y));
					}
					for (x = 0; x < w2; x++) {
						var searchindex = map[y*w2+x];
						if (searchindex.r == detailArray[color].r 
							&& searchindex.g == detailArray[color].g 
							&& searchindex.b == detailArray[color].b){

								detailmap[y,x] = 1;
						}
						else{
							detailmap[y,x] = 0;
						}
					}
				}
			}
			terrain.SetDetailLayer(0, 0, detailInt[color], detailmap);
			//for (y = 0; y < terrain.detailHeight; y++) {
			//	for (x = 0; x < terrain.detailWidth; x++) {
			//		detailmap[x,y] = 0;
			//	}
			//}
		}
		EditorUtility.ClearProgressBar();
		Debug.Log("Done");
	}

	function resize(w,h,w2,h2,texture){
		var colormap : Texture2D = texture as Texture2D;
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
		return map;
	}
}