function filterBadWords(input) {
  // List of offensive words
  const badWords = [
    "ngentot",
    "ngentu",
    "kontol",
    "memek",
    "ena",
    "crottttt",
    "ngh3nttt000yyyy",
    "crot",
    "3",
    "ng3nthu",
    "ngentod",
  ];

  // Replace bad words with asterisks
  const filteredInput = input.replace(
    new RegExp(badWords.join("|"), "gi"),
    (match) => "*".repeat(match.length)
  );

  return filteredInput;
}
const audio = (() => {
  var instance = undefined;

  var getInstance = () => {
    if (!instance) {
      instance = new Audio();
      instance.autoplay = true;
      instance.src = document
        .getElementById("tombol-musik")
        .getAttribute("data-url");
      instance.load();
      instance.currentTime = 0;
      instance.volume = 1;
      instance.muted = false;
      instance.loop = true;
    }

    return instance;
  };

  return {
    play: () => {
      getInstance().play();
    },
    pause: () => {
      getInstance().pause();
    },
  };
})();

const buttonPlayMusic = document.getElementById("tombol-musik");
buttonPlayMusic.addEventListener("touchstart", () => {
  audio.play();
});
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
const showGift=()=>{
  const giftCard=document.getElementById("gift-card")
  giftCard.style.display="block"
}
const salin = (btn) => {
  navigator.clipboard.writeText(btn.getAttribute("data-nomer"));
  let tmp = btn.innerHTML;
  btn.innerHTML = "Tersalin";
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = tmp;
    btn.disabled = false;
    btn.focus();
  }, 1500);
};

const timer = () => {
  var countDownDate = new Date(
    document
      .getElementById("tampilan-waktu")
      .getAttribute("data-waktu")
      .replace(" ", "T")
  ).getTime();
  var time = undefined;
  var distance = undefined;

  time = setInterval(() => {
    distance = countDownDate - new Date().getTime();

    if (distance < 0) {
      clearInterval(time);
      time = undefined;
      return;
    }

    document.getElementById("hari").innerText = Math.floor(
      distance / (1000 * 60 * 60 * 24)
    );
    document.getElementById("jam").innerText = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    document.getElementById("menit").innerText = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    document.getElementById("detik").innerText = Math.floor(
      (distance % (1000 * 60)) / 1000
    );
  }, 1000);
};

const buka = async () => {
  document.getElementById("tombol-musik").style.display = "block";
  audio.play();
  AOS.init();
  await login();
  timer();
};

const play = (btn) => {
  if (btn.getAttribute("data-status").toString() != "true") {
    btn.setAttribute("data-status", "true");
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
  } else {
    btn.setAttribute("data-status", "false");
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  }
};

const resetForm = () => {
  document.getElementById("kirim").style.display = "block";
  document.getElementById("hadiran").style.display = "block";
  document.getElementById("labelhadir").style.display = "block";
  document.getElementById("batal").style.display = "none";
  document.getElementById("kirimbalasan").style.display = "none";
  document.getElementById("idbalasan").value = null;
  document.getElementById("balasan").innerHTML = null;
  document.getElementById("formnama").value = null;
  document.getElementById("hadiran").value = 0;
  document.getElementById("formpesan").value = null;
};

const balasan = async (button) => {
  button.disabled = true;
  let tmp = button.innerText;
  button.innerText = "Loading...";

  let id = button.getAttribute("data-uuid").toString();

 

  const BALAS = document.getElementById("balasan");
  BALAS.innerHTML = renderLoading(1);
  document.getElementById("hadiran").style.display = "none";
  document.getElementById("labelhadir").style.display = "none";

  const REQ = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
  };

  await fetch(
    document.querySelector("body").getAttribute("data-url") +
      "/api/comment/" +
      id,
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      const item = {
        uuid:res.data.uuid,
        nama: res.data.name,
        hadir: res.data.presence,
        created_at: res.data.created_at,
        komentar: res.data.detail,
        comment: res.data.comments,
      };
        document.getElementById("kirim").style.display = "none";
        document.getElementById("batal").style.display = "block";
        document.getElementById("kirimbalasan").style.display = "block";
        document.getElementById("idbalasan").value = id;
        const namaSplit = item.nama.split("|");
        const nama = namaSplit.length > 1 ? namaSplit[1] : namaSplit[0];
        BALAS.innerHTML = `
                <div class="card-body bg-light shadow p-3 my-2 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center">
                        <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                            <strong>${escapeHtml(nama)}</strong>
                        </p>
                        <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                          item.created_at
                        }</small>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="text-dark m-0 p-0" style="white-space: pre-line">${escapeHtml(
                      filterBadWords(item.komentar)
                    )}</p>
                </div>`;
   
    })
    .catch((err) => {
      resetForm();
      alert(err);
    });

  document.getElementById("ucapan").scrollIntoView({ behavior: "smooth" });
  button.disabled = false;
  button.innerText = tmp;
};

const kirimBalasan = async () => {
  let nama = document.getElementById("formnama").value;
  let komentar = document.getElementById("formpesan").value;
  let id = document.getElementById("idbalasan").value;

  if (nama.length == 0) {
    alert("nama tidak boleh kosong");
    return;
  }

  if (nama.length >= 35) {
    alert("panjangan nama maksimal 35");
    return;
  }

  if (komentar.length == 0) {
    alert("pesan tidak boleh kosong");
    return;
  }

  document.getElementById("batal").disabled = true;
  document.getElementById("kirimbalasan").disabled = true;
  let tmp = document.getElementById("kirimbalasan").innerHTML;
  document.getElementById(
    "kirimbalasan"
  ).innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

  const REQ = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nama: "rizal|" + nama,
      id: id,
      komentar: komentar,
    }),
  };

  let isSuccess = false;

  await fetch(
    document.querySelector("body").getAttribute("data-url") + "/api/comment",
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      isSuccess = true;
    })
    .catch((err) => {
      resetForm();
      alert(err);
    });

  if (isSuccess) {
    await ucapan();
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    resetForm();
  }

  document.getElementById("batal").disabled = false;
  document.getElementById("kirimbalasan").disabled = false;
  document.getElementById("kirimbalasan").innerHTML = tmp;
};

const innerCard = (comment) => {
  let result = "";

  comment.forEach((data) => {
    const item = {
      uuid:data.uuid,
      nama: data.name,
      hadir: data.presence,
      created_at: data.created_at,
      komentar: data.detail,
      comment: data.comments,
    };
    const namaSplit = item.nama.split("|");
    const nama = namaSplit.length > 1 ? namaSplit[1] : namaSplit[0];

    result += `
        <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-2 me-0" id="${
          item.uuid
        }">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong>${escapeHtml(nama)}</strong>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                  item.created_at
                }</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(
              filterBadWords(item.komentar)
            )}</p>
            <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${
              item.uuid
            }" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
            ${innerCard(item.comment)}
        </div>`;
  });

  return result;
};

const renderCard = (data) => {
  const namaSplit = data.nama.split("|");
  const nama = namaSplit.length > 1 ? namaSplit[1] : namaSplit[0];
  const DIV = document.createElement("div");
  DIV.classList.add("mb-3");
  DIV.innerHTML = `
    <div class="card-body bg-light shadow p-3 m-0 rounded-4" id="${data.uuid}">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1">${escapeHtml(nama)}</strong>${
    data.hadir
      ? '<i class="fa-solid fa-circle-check text-success"></i>'
      : '<i class="fa-solid fa-circle-xmark text-danger"></i>'
  }
            </p>
            <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
              data.created_at
            }</small>
        </div>
        <hr class="text-dark my-1">
        <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(
          filterBadWords(data.komentar)
        )}</p>
        <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
        ${innerCard(data.comment)}
    </div>`;
  return DIV;
};

const renderLoading = (num) => {
  let hasil = "";
  for (let index = 0; index < num; index++) {
    hasil += `
        <div class="mb-3">
            <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-3"></span>
                </div>
                <hr class="text-dark my-1">
                <p class="card-text placeholder-glow">
                    <span class="placeholder bg-secondary col-6"></span>
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-12"></span>
                </p>
            </div>
        </div>`;
  }

  return hasil;
};

const pagination = (() => {
  const perPage = 10;
  var pageNow = 0;
  var resultData = 0;

  var disabledPrevious = () => {
    document.getElementById("previous").classList.add("disabled");
  };

  var disabledNext = () => {
    document.getElementById("next").classList.add("disabled");
  };

  var buttonAction = async (button) => {
    let tmp = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
    await ucapan();
    button.disabled = false;
    button.innerHTML = tmp;
    document
      .getElementById("daftarucapan")
      .scrollIntoView({ behavior: "smooth" });
  };

  return {
    getPer: () => {
      return perPage;
    },
    getNext: () => {
      return pageNow;
    },
    reset: async () => {
      pageNow = 0;
      resultData = 0;
      await ucapan();
      document.getElementById("next").classList.remove("disabled");
      disabledPrevious();
    },
    setResultData: (len) => {
      resultData = len;
      if (resultData < perPage) {
        disabledNext();
      }
    },
    previous: async (button) => {
      if (pageNow < 0) {
        disabledPrevious();
      } else {
        pageNow -= perPage;
        disabledNext();
        await buttonAction(button);
        document.getElementById("next").classList.remove("disabled");
        if (pageNow <= 0) {
          disabledPrevious();
        }
      }
    },
    next: async (button) => {
      if (resultData < perPage) {
        disabledNext();
      } else {
        pageNow += perPage;
        disabledPrevious();
        await buttonAction(button);
        document.getElementById("previous").classList.remove("disabled");
      }
    },
  };
})();

const ucapan = async () => {
  const UCAPAN = document.getElementById("daftarucapan");
  UCAPAN.innerHTML = renderLoading(pagination.getPer());

  const REQ = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  var currentPage = Math.ceil(pagination.getNext()  / 10)+1
  await fetch(
    document.querySelector("body").getAttribute("data-url") + `/api/comment?page=${currentPage}`,
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      UCAPAN.innerHTML = null;
      res.data.forEach((data) => {
        const item = {
          uuid:data.uuid,
          nama: data.name,
          hadir: data.presence,
          created_at: data.created_at,
          komentar: data.detail,
          comment: data.comments,
        };
          UCAPAN.appendChild(renderCard(item));
      });
      // console.log(res.data.length)
      pagination.setResultData(res.data.length);

      if (res.data.length == 0) {
        UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
      }
    })
    .catch((err) => alert(err));
};

const login = async () => {
  document.getElementById("daftarucapan").innerHTML = renderLoading(
    pagination.getPer()
  );
  ucapan();
};

const kirim = async () => {
  let nama = document.getElementById("formnama").value;
  let hadir = document.getElementById("hadiran").value;
  let komentar = document.getElementById("formpesan").value;
  if (nama.length == 0) {
    alert("nama tidak boleh kosong");
    return;
  }

  if (nama.length >= 35) {
    alert("panjangan nama maksimal 35");
    return;
  }

  if (hadir == 0) {
    alert("silahkan pilih kehadiran");
    return;
  }

  if (komentar.length == 0) {
    alert("pesan tidak boleh kosong");
    return;
  }

  document.getElementById("kirim").disabled = true;
  let tmp = document.getElementById("kirim").innerHTML;
  document.getElementById(
    "kirim"
  ).innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

  const REQ = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nama: "rizal|" + nama,
      hadir: hadir == 1,
      komentar: komentar,
    }),
  };
  await fetch(
    document.querySelector("body").getAttribute("data-url") + "/api/comment",
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      resetForm();
      pagination.reset();
    })
    .catch((err) => {
      resetForm();
      alert(err);
    });

  document.getElementById("kirim").disabled = false;
  document.getElementById("kirim").innerHTML = tmp;
};

const progressBar = (() => {
  let bar = document.getElementById("bar");

  let clear = null;
  let second = 1;
  let counter = 1;
  let untilOneHundred = parseInt(bar.style.width.replace("%", ""));

  clear = setInterval(() => {
    if (untilOneHundred < 100) {
      untilOneHundred =
        (counter + untilOneHundred / 10) / (second + untilOneHundred / 100);
      setNum(untilOneHundred);
    } else {
      clearInterval(clear);
    }

    if (counter % 100 == 0) {
      second += 1;
    }

    counter += 1;
  }, 10);

  let setNum = (num) => {
    bar.style.width = num + "%";
    bar.innerText = Math.floor(num) + "%";
  };

  return {
    stop: () => {
      clearInterval(clear);
      setNum(100.0);
    },
  };
})();

const opacity = () => {
  let modal = new Promise((res) => {
    let clear = null;
    clear = setInterval(() => {
      if (document.getElementById("exampleModal").classList.contains("show")) {
        clearInterval(clear);
        res();
      }
    }, 100);
  });

  modal.then(() => {
    progressBar.stop();

    let op = parseInt(document.getElementById("loading").style.opacity);
    let clear = null;

    clear = setInterval(() => {
      if (op >= 0) {
        op -= 0.025;
        document.getElementById("loading").style.opacity = op;
      } else {
        clearInterval(clear);
        document.getElementById("loading").remove();
        document.getElementById("exampleModal").classList.add("fade");
      }
    }, 10);
  });
};

const modalFoto = (btn) => {
  let modal = new bootstrap.Modal("#modalFoto");
  let img = document.getElementById("showModalFoto");
  img.src = btn.src;
  modal.show();
};

window.addEventListener(
  "load",
  () => {
    let modal = new bootstrap.Modal("#exampleModal");
    let name = new URLSearchParams(window.location.search).get("to") ?? "";

    if (name.length == 0) {
      document.getElementById("namatamu").remove();
    } else {
      let div = document.createElement("div");
      div.classList.add("m-2");
      div.innerHTML = `
        <p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p>
        <h2 class="text-light">${escapeHtml(name)}</h2>
        `;

      document.getElementById("formnama").value = name;
      document.getElementById("namatamu").appendChild(div);
    }

    modal.show();
    opacity();
  },
  false
);
