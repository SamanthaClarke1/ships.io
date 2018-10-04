$(function() {
    for(let i = 0; i < 36;i++){
    $('.navigation').append(
        '<div class="btn btn-outline-warning col-2 navc navitem'+i+'" onclick="(selectdestination('+i+'))">'+i+'</div>'


    );


    


    };
});
function selectdestination(place){
    for(let i = 0; i < 36;i++){
       
            
            $('.navitem'+i).removeClass('active')
    
        
    }
    $('.navitem'+place).addClass('active');
    $('.roomn').val(place);
    console.log('jsd');
}