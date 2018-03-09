"use strict";


const LAB = {
    toast: function(text) {
        $.snackbar({
            content: text,
            style: "toast",
            timeout: 2000
        })
    },
}


function labPost(url, postData) {
    return new Promise(resolve => {
        // console.log(postData)
        $.post(url, postData, function(data, textStatus) {
            resolve(data)
        }, "json");
    });
}

async function update() {
    const dataCat = await labPost("list")
    await catUpdate(dataCat)
    await Subupdate((dataCat[0].id).toString()) // (take id from first in category and select with this id to SubCat) 


    // Category remove
    $('.CategoryDelete').click(async(e) => {
        e.stopPropagation();
        let id = $(e.currentTarget).parent().data('cat_id')
        await labPost("del", id.toString())
        await update()
    })

    // change active status from Category on clic
    $(".l-cat-elem").click(async(t) => {
        $(".l-cat-elem").removeClass('active')
        $(t.currentTarget).addClass("active")

        await Subupdate(JSON.stringify($(t.currentTarget).data('cat_id'))) //(put id from chosen point from category to json for serv)
    })
}

async function Subupdate(cat_id) {
    const dataSubCat = await labPost("Sublist", cat_id)
    console.log(dataSubCat)

    SubcatUpdate(dataSubCat)
}


async function SUBCATADD() {
    var ig = $('.list-group-item.list-group-item-action.l-cat-elem.active').data('cat_id'); //find current active from cat for insert in subcat

    let out = {
        name_cat: $("#name_subc").val(),
        url_cat: $("#url_subc").val(),
        id_subc: ig
    }

    // document.getElementById("name_subc").value = "";
    // document.getElementById("url_subc").value = "";

    let res = await labPost("insert", JSON.stringify(out))
    if (res) {
        LAB.toast("Успешно")
    } else {
        LAB.toast("Ошибка доабвления")
    }

    update()
}


async function CATADD() {
    const dataCat = await labPost("list")

    let out = {
        name_cat: $("#name_cat").val(),
        url_cat: $("#url_cat").val()
    }

    document.getElementById("name_cat").value = "";
    document.getElementById("url_cat").value = "";

    let res = await labPost("insert", JSON.stringify(out))
    if (res) {
        LAB.toast("Успешно")
    } else {
        LAB.toast("Ошибка доабвления")
    }

    update()
}

async function CATEDIT() {
    let out = {
        name_cat: $("#CatEditName").val(),
        url_cat: $("#CatEditUrl").val(),
        id_cat: $('#l-EditCategory').data("id")
    }

    let res = await labPost("edit", JSON.stringify(out))
    if (res) {
        LAB.toast("Успешно")
    } else {
        LAB.toast("Ошибка редактирвоания")
    }

    update()
}

// filling in the SUBcategory table

function SubcatUpdate(dataSubCat) {
    let list = $("#listSubCategory")
    list.empty()
    for (let i = 0; i < dataSubCat.length; i++) {
        const el = dataSubCat[i];

        let listEl = `
            <div class="list-group-item list-group-item-action l-Subcat-elem data-cat_id=${el.id_subc}">
                ${el.name_subc}
                <button type="button" class="btn btn-danger btn-sm l-button_action SubCategoryDelete">
                <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-bin"></use></svg>
            </button>  
            <button type="button" class="btn btn-success btn-sm l-button_action SubCategoryEdit" data-toggle="modal" data-target="#l-EditSubCategory" data-modal_id_subc=${el.id_subc} data-modal_id_cat=${el.id_cat} data-modal_name_subc=${el.name_subc} data-modal_url_subc=${el.url_subc}>
                <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-pencil"></use></svg>
            </button>
            </div>`

        list.append(listEl)
    }
    list.children().first().addClass("active")
}

// async function CatDelete() {

//     let id = $(e.currentTarget).parent().data('cat_id')
//     await labPost("del", id.toString())
//     await update()

// }

// filling in the category table
async function catUpdate(dataCat) {
    console.log("4")
    let list = $("#listCategory")
    list.empty()

    for (let i = 0; i < dataCat.length; i++) {
        const el = dataCat[i];

        let listEl = `
            <div class="list-group-item list-group-item-action l-cat-elem" data-cat_id=${el.id}>
                ${el.name}
                <button type="button" class="btn btn-danger btn-sm l-button_action CategoryDelete" data-toggle="modal" data-target="#l-DeleteCategory" data-id=${el.id}>
                    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-bin"></use></svg>
                </button>  
                <button type="button" class="btn btn-success btn-sm l-button_action SubCategoryEdit" data-toggle="modal" data-target="#l-EditCategory" data-modal_id=${el.id} data-modal_name=${el.name} data-modal_url=${el.url}>
                    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-pencil"></use></svg>
                </button>
            </div>`

        list.append(listEl)
    }
    console.log("5")
    list.children().first().addClass("active")
}

async function CATEDIT() {
    let out = {
        name_cat: $("#CatEditName").val(),
        url_cat: $("#CatEditUrl").val(),
        id_cat: $('#l-EditCategory').data("id")
    }

    let res = await labPost("edit", JSON.stringify(out))
    if (res) {
        LAB.toast("Успешно")
    } else {
        LAB.toast("Ошибка редактирвоания")
    }

    update()
}


// async function TH() {
//     console.log("test")
//     await labPost("test")
//     console.log("after")
// }


async function labStart() {
    await update()

    // Category modals
    $("#CATADD").click(CATADD)
    $("#CATEDIT").click(CATEDIT)


    //$("#three").click(TH)


    // Category placeholder
    $('#l-EditCategory').on('show.bs.modal', function(event) {
        let button = $(event.relatedTarget)
        let EditingName = button.data('modal_name')
        let EditingUrl = button.data('modal_url')
        let EditingId = button.data('modal_id')

        $(this).find('#CatEditName').val(EditingName)
        $(this).find('#CatEditUrl').val(EditingUrl)
        $(this).data('id', EditingId)
    })

    // Category search
    $('#CatSearch').on('input', async function() {
        let text = $('#CatSearch').val()

        let res = await labPost("search", text)

        catUpdate(res)
        LAB.toast(`Найдено: ${res.length}`)
    });


    // $('.CategoryDelete').click(async(e) => {
    //     let id = $(e.currentTarget).parent().data('cat_id')
    //     console.log("--------------------------")
    //     console.log("1")
    //     await labPost("del", id.toString())
    //     console.log("2")
    //     await update()
    //     console.log("8")

    //     // await Subupdate(JSON.stringify($(e.currentTarget).data('cat_id')))

    // })


    // SubCategory modals
    $("#SUBCATADD").click(SUBCATADD)
        // SubCategory placeholder
    $('#l-EditSubCategory').on('show.bs.modal', function(event) {
        let button = $(event.relatedTarget)
        let EditingName = button.data('modal_name_subc')
        let EditingUrl = button.data('modal_url_subc')
        let EditingId = button.data('modal_id_cat')

        $(this).find('#SubCatEditName').val(EditingName)
        $(this).find('#SubCatEditUrl').val(EditingUrl)
        $(this).data('id', EditingId)
    })


    // SubCategory placeholder
    $('#l-EditSubCategory').on('show.bs.modal', function(event) {
        let button = $(event.relatedTarget)
        let EditingName = button.data('modal_name_subc')
        let EditingUrl = button.data('modal_url_subc')
        let EditingId = button.data('modal_id_cat')

        $(this).find('#SubCatEditName').val(EditingName)
        $(this).find('#SubCatEditUrl').val(EditingUrl)
        $(this).data('id', EditingId)
    })


}

$(document).ready(labStart)