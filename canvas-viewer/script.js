var method = "chunk";

function getURLValues() {
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('method') != null) method = searchParams.get('method');
    if (searchParams.get('x') != null) document.querySelector("#x").value = searchParams.get('x');
    if (searchParams.get('y') != null) document.querySelector("#y").value = searchParams.get('y');
    if (searchParams.get('id') != null) document.querySelector("#hq-id").value = searchParams.get('id');
    document.querySelector(".method-input").value = method;
    changeMethod(method);
    getImage();
}

function getImage(set_url=false) {
    if (method == "chunk") {
        let x = document.querySelector("#x").value;
        let y = document.querySelector("#y").value;
        let url = `https://backend.wplace.live/files/s0/tiles/${x}/${y}.png`;

        if (x == "" || y == "") return

        document.querySelector(".img-preview").src = url;
        document.querySelector(".chunk-newtab-btn").href = url;

        if (set_url) window.location.search = `?method=${method}&x=${x}&y=${y}`;
        return
    }
    if (method == "hq") {
        let hq_id = document.querySelector("#hq-id").value;
        let url = `https://backend.wplace.live/alliances/${hq_id}/headquarters/image`;

        if (hq_id == "") return

        document.querySelector(".img-preview").src = url;
        document.querySelector(".hq-newtab-btn").href = url;

        if (set_url) window.location.search = `?method=${method}&id=${hq_id}`;
        return
    }
}

function setBG(color) {
    document.querySelector(".img-bg").classList.remove("bg-white");
    document.querySelector(".img-bg").classList.remove("bg-[#9ebdff]");
    document.querySelector(".img-bg").classList.remove("bg-[#e3efd4]");
    document.querySelector(".img-bg").classList.remove("bg-[#45516E]");
    document.querySelector(".img-bg").classList.add(color);
}

function changeMethod(sel_method) {
    method = sel_method;

    document.querySelector(".chunk-form").classList.add("hidden");
    document.querySelector(".hq-form").classList.add("hidden");

    document.querySelector("."+method+"-form").classList.remove("hidden");
}

function test_get_alliance_images() {
    let alliance_id = document.querySelector("#hq-id").value;

    if (method == "hq" && alliance_id != "") {
        document.querySelector(".hq-form").innerHTML += `
            <div class="flex flex-row gap-2 w-[100%] items-center">
                <div class="w-[50%]"><center><img src="https://backend.wplace.live/alliances/${alliance_id}/assets/picture"></center></div>
                <div class="w-[50%]"><center><img src="https://backend.wplace.live/alliances/${alliance_id}/assets/banner"></center></div>
            </div>
        `;
    }
}
