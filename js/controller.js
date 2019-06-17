function d(date){ //formato fecha
  return new Date(date).toJSON().slice(0,10).split('-').reverse().join('/')
}

function m(number){ //formato moneda
  return Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(number)
}

function totalSales(){ // suma total
  return dataSet.reduce( (a,b) => {return a + b.total} , 0);
}

function groupBySumDateClosed(limit=100,name='name',ord='asc'){ //Resumen de ventas por dia

  let auxSum = [], auxCount = [], auxDiners = []
  let auxEfectivo = [], auxCredito = [], auxDebito = []
  let auxEfectivoSum = [], auxCreditoSum = [], auxDebitoSum = []

  let result = dataSet.reduce((a, c) => {
      // obtenemos primer elemento del string date
      const [dateStr] = c.date_closed.split(" ")
      let name = dateStr
      if (!auxSum.hasOwnProperty(name) && !a.hasOwnProperty(name)){
        // inicializamos variables
        auxCreditoSum[name]=auxSum[name]=auxCount[name]=auxDiners[name]=auxEfectivo[name]=0;
        auxCredito[name]=auxDebito[name]=auxEfectivoSum[name]=auxDebitoSum[name]=a[name]=0;
      }
      //acumulamos variables
      auxSum[name] += 1*c.total
      auxCount[name]++
      auxDiners[name] += 1*c.diners
      c.payments.map( payments => {
          if (payments.type=='Efectivo'){
            auxEfectivo[name]++
            auxEfectivoSum[name] += payments.amount
          }else if (payments.type=='Tarjeta débito'){
            auxDebito[name]++
            auxDebitoSum[name] += payments.amount
          }else if (payments.type=='Tarjeta crédito'){
            auxCredito[name]++
            auxCreditoSum[name] += payments.amount
          }
      });
      // creamos objeto
      a[name] = {
                  name: name,
                  total: auxSum[name],
                  orders:auxCount[name],
                  diners:auxDiners[name],
                  payments:{
                    efectivo:{transactions:auxEfectivo[name], total: auxEfectivoSum[name]},
                    debito:{transactions:auxDebito[name], total: auxDebitoSum[name]},
                    credito:{transactions:auxCredito[name], total: auxCreditoSum[name]}
                  }
                }
      return a
    }, []
  )
  //ordenamos por 'ord', devolvemos primeros 'limit' objetos
  return Object.values(result).slice(0,limit).sort( (a, b) => {
    return ord=='asc' ? new Date(a[name]) - new Date(b[name]) : new Date(b[name]) - new Date(a[name]);
  })

}

// Products
function getProductsFlatt(){ //obtenemos Array de Productos vendidos Flatten
  return [].concat(...dataSet.map( e => e.products))
}

function getProductsGroup(){ //obtenemos Array agrupando count y total

  let products=getProductsFlatt()
  let auxSum = [], auxCount = []
  return products.reduce((a, c) => { /*reducimos para agrupar por count y total*/
    let name = c.name
    if (!auxCount.hasOwnProperty(name) && !a.hasOwnProperty(name)){
      a[name]=auxCount[name]=auxSum[name]=0;
    }
    auxCount[name] += 1*c.quantity
    auxSum[name] += 1*c.quantity*c.price
    a[name] = {
                name: c.name,
                count: auxCount[name],
                total: auxSum[name]
              }
    return a
  }, []
  )
}

function getProductsOrdered(arrProducts, name, ord='desc'){
  return Object.values(arrProducts).sort( (a, b) => { //ordenamos segun ord
    return ord=='desc' ? b[name]-a[name] : (ord=='asc' ? a[name]-b[name] : 0)
  })
}
//fin Products


//Waiters, Cashiers, Zone, Table
function getGroupByName(byName='cashier'){ //Ordenes agrupadas por 'byName'
  let auxSum = [], auxCount = []
  let result = dataSet.reduce((a, c) => {
    let name = c[byName]
    if (!auxCount.hasOwnProperty(name) && !a.hasOwnProperty(name)){
      a[name]=[];
      auxCount[name]=0;
      auxSum[name]=0;
    }
    auxSum[name] += 1*c.total
    auxCount[name]++
    a[name] = {
                name: c[byName],
                count: auxCount[name],
                total: auxSum[name]
              }
    return a
  }, []
  )
  return result
}

function getGroupOrdered(arr, field, ord='desc'){//obtenemos arr ordenado(ord) por campo (field)
  return Object.values(arr).sort( (a, b) => {
    return ord=='desc' ? b[field]-a[field] : (ord=='asc' ? a[field]-b[field] : 0)
  })
}
//fin Waiters, Cashiers, Zone, Table

$( document ).ready(function() {

    //CASHIERS
    $( "#btnReportCashiers" ).click(function(){
      let cashiersOrdered = getGroupOrdered( getGroupByName('cashier'), 'count' );
      if (!$("#tblCashiersCount tbody tr").length){
        $.each(cashiersOrdered, function( index, value ) {
          let count='<tr><td>--name--</td><td>--orders--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--orders--", value.count);
          $("#tblCashiersCount tbody").append(count);
        });
      }
      let cashiersOrderedtot = getGroupOrdered( getGroupByName('cashier'), 'total' );
      if (!$("#tblCashiersTotal tbody tr").length){
        $.each(cashiersOrderedtot, function( index, value ) {
          let count='<tr><td>--name--</td><td>--total--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--total--", m(value.total));
          $("#tblCashiersTotal tbody").append(count);
        });
      }
    });

    //WAITERS
    $( "#btnReportWaiters" ).click(function(){
      let waitersOrdered = getGroupOrdered( getGroupByName('waiter'), 'count' );
      if (!$("#tblWaitersCount tbody tr").length){
        $.each(waitersOrdered, function( index, value ) {
          let count='<tr><td>--name--</td><td>--orders--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--orders--", value.count);
          $("#tblWaitersCount tbody").append(count);
        });
      }
      let waitersOrderedtot = getGroupOrdered( getGroupByName('waiter'), 'total' );
      if (!$("#tblWaitersTotal tbody tr").length){
        $.each(waitersOrderedtot, function( index, value ) {
          let count='<tr><td>--name--</td><td>--total--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--total--", m(value.total));
          $("#tblWaitersTotal tbody").append(count);
        });
      }
    });

    //ZONE
    $( "#btnReportZone" ).click(function(){
      let zonesOrdered = getGroupOrdered( getGroupByName('zone'), 'count' );
      if (!$("#tblZonesCount tbody tr").length){
        $.each(zonesOrdered, function( index, value ) {
          let count='<tr><td>--name--</td><td>--orders--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--orders--", value.count);
          $("#tblZonesCount tbody").append(count);
        });
      }
      let zonesOrderedtot = getGroupOrdered( getGroupByName('zone'), 'total' );
      if (!$("#tblZonesTotal tbody tr").length){
        $.each(zonesOrderedtot, function( index, value ) {
          let count='<tr><td>--name--</td><td>--total--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--total--", m(value.total));
          $("#tblZonesTotal tbody").append(count);
        });
      }
    });

    //PRODUCTS
    $( "#btnReportProducts" ).click(function(){
      let prods = getProductsGroup()
      let ordered = getProductsOrdered( prods, 'count');
      if (!$("#tblProductsCount tbody tr").length){
        $.each(ordered, function( index, value ) {
          let count='<tr><td>--name--</td><td>--orders--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--orders--", value.count);
          $("#tblProductsCount tbody").append(count);
        });
      }
      let orderedtot = getProductsOrdered( prods, 'total');
      if (!$("#tblProductsTotal tbody tr").length){
        $.each(orderedtot, function( index, value ) {
          let count='<tr><td>--name--</td><td>--total--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--total--", m(value.total));
          $("#tblProductsTotal tbody").append(count);
        });
      }
    });

    //TABLE
    $( "#btnReportTable" ).click(function(){
      let tablesOrdered = getGroupOrdered( getGroupByName('table'), 'count' );
      if (!$("#tblTablesCount tbody tr").length){
        $.each(tablesOrdered, function( index, value ) {
          let count='<tr><td>Mesa: --name--</td><td>--orders--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--orders--", value.count);
          $("#tblTablesCount tbody").append(count);
        });
      }
      let tablesOrderedtot = getGroupOrdered( getGroupByName('table'), 'total' );
      if (!$("#tblTablesTotal tbody tr").length){
        $.each(tablesOrderedtot, function( index, value ) {
          let count='<tr><td>--name--</td><td>--total--</td></tr>';
          count = count.replace("--name--", value.name);
          count = count.replace("--total--", m(value.total));
          $("#tblTablesTotal tbody").append(count);
        });
      }
    });

  //RESUMEN
  $( "#btnSales" ).click(function(){
    // RESUMEN VENTA PERIODO
    let sales = groupBySumDateClosed();
    if (!$("#tblSales tbody tr").length){
      // total
      $("#lblTotal").html(m(totalSales()))
      $.each(sales, function( index, value ){
        let item =  '<tr><th class="text-center" scope="row">--date--</th>'
        item += '<td class="text-center">--total--</td>'
        item += '<td class="text-center">--orders--</td>'
        item += '<td class="text-center">--diners--</td>'
        item += '<td class="text-right">--cash--</td>'
        item += '<td class="text-center">--cashope--</td>'
        item += '<td class="text-right">--debit--</td>'
        item += '<td class="text-center">--debitope--</td>'
        item += '<td class="text-right">--credit--</td>'
        item += '<td class="text-center">--creditope--</td>'
        item += '</tr>';

        item = item.replace("--date--", d(value.name)).replace("--total--", m(value.total))
               .replace("--total--", m(value.total)).replace("--orders--", value.orders)
               .replace("--diners--", value.diners)
               .replace("--cash--", m(value.payments.efectivo.total))
               .replace("--cashope--", value.payments.efectivo.transactions)
               .replace("--debit--", m(value.payments.debito.total))
               .replace("--debitope--", value.payments.debito.transactions)
               .replace("--credit--", m(value.payments.credito.total))
               .replace("--creditope--", value.payments.credito.transactions);
        $("#tblSales tbody").append(item);
      });
    }
  });

});
