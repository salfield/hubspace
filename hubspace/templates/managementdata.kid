<?python
from hubspace.utilities.permissions import locations
from hubspace.utilities.uiutils import select_home_hub, now
from hubspace.controllers import get_place, permission_or_owner
from hubspace.templates.locationAdmin import loc_admin
from turbogears import identity
from hubspace.utilities.users import fields as user_fields

user_columns = user_fields.values()
?>

<div id="managementdataContent" class="pane" xmlns:py="http://purl.org/kid/ns#" py:strip="True">    
    <h1>Management Data</h1>

    <div class="dataBox">
        <div class="dataBoxHeader">
	    <a class="title" id="link_adminStuff0"><h2>Download Usage summary</h2></a>
	</div>
        <div class="dataBoxContent">
            <form id="usage_summary">
            <div>
                <span>Select Location</span>
                <select name="place">
                   <option py:for="location in locations()" value="${location.id}" py:attrs="select_home_hub(location)">${location.name}</option>
                </select>
        
            </div>
            <div>
                 <table border="0">
                 <tr>
                 <td> Select columns to include</td>
                 <td> <input type="checkbox" name="columns_selection" value="resourcetype">Resource Type</input> </td>
                 <td> <input type="checkbox" name="columns_selection" value="resourceid">Resource ID</input> </td>
                 <td> <input type="checkbox" name="columns_selection" value="invoiced" checked="checked">Invoiced</input> </td>
                 <td> <input type="checkbox" name="columns_selection" value="total" checked="checked">Total</input> </td>
                 </tr>
                 <!--
                 <tr>
                 <td> Only active resources </td>
                 <td> <input type="checkbox" name="only_active" value="1" checked="checked"></input> </td>
                 </tr>
                 -->
                 </table>
            </div>
        
             <div>
                 <br />
                 <a href="#" class="small yellow nicebutton" id="usage_summary_csv" >Download spreadsheet</a>
             </div>
             </form>    
           </div>
        </div>
        
    <div class="dataBox">
        <div class="dataBoxHeader">
	    <a class="title" id="link_adminStuff1"><h2>Export User Data</h2></a>
	</div>
    <div class="dataBoxContent">
    
     <form id="users_export">
     <div>
         <span>Select Location</span>
         <select name="location">
            <option py:if="identity.has_permission('superuser')" value="all">All</option>
            <option py:for="location in locations()" value="${location.id}" py:attrs="select_home_hub(location)">${location.name}</option>
         </select>
     <i py:if="identity.has_permission('superuser')"> * Selecting "All" location may result in slower report generation</i>

     </div>
     <div>
          <table border="0">
          <tr>
          <td> Select columns to include</td>
          <td> <input type="checkbox" py:for="attr_d in user_columns" name="usercols_selction" py:attrs="attr_d" >${attr_d["label"]}</input> </td>
          </tr>
          <tr>
          <td> Select column to sort by</td>
          <td> <input type="radio" py:for="attr_d in user_columns" name="sortname" value="${attr_d['value']}" 
            py:attrs="attr_d['value'] == 'display_name' and {'checked': '1'} or {}">${attr_d["label"]}</input> </td>
          </tr>
          </table>
     </div>

      <div>
          <br />
          <a href="#" id="users_grid" class="small yellow nicebutton">View</a>
          <a href="#" class="small yellow nicebutton" id="users_csv" >Download spreadsheet</a>
      </div>
      </form>

    <br/>
    <table id="flex1"></table>
    </div>
    </div>

    <div class="dataBox">
        <div class="dataBoxHeader">
	    <a class="title" id="management_reports"><h2>Reports (Preview feature)</h2></a>
            <div class="dataBoxContent">
            <form id="report_conf" action="/generate_report" method="post">
            <div>
                <span>1. Select Location</span><br/>
                <?python
                locs = [loc for loc in locations() if len(loc.resources) > 2]
                ?>
                <c py:for="loc in locs"> <input type="checkbox" name="locations" value="${loc.id}" py:attrs="select_home_hub(loc,'checked')"/>${loc.name} </c>
            </div>
            <br/>
            <span>2. Select options to be included in the report</span><br/>
            <table>
            <tr>
                <td> <input name="report_types" value="member_summary" type="checkbox" checked="1"/> </td>
                <td> Member Summary  </td>
            </tr>
            <tr>
                <td> <input name="report_types" value="revenue_summary" type="checkbox" checked="1"/> </td>
                <td> Revenue Summary  </td>
            </tr>
            <tr>
                <td> <input name="report_types" value="revenue_stats" type="checkbox" checked="1"/> </td>
                <td> Revenue Performance</td>
            </tr>
            <tr>
                <td> <input name="report_types" value="churn_stats" type="checkbox" checked="1"/> </td>
                <td> Churn Rate  </td>
            </tr>
            <tr>
                <td> <input name="report_types" value="revenue_by_resourcetype" type="checkbox" /> </td>
                <td>% Revenue by Resource type  </td>
            </tr>
            <tr>
                <td> <input name="report_types" value="revenue_by_resource" type="checkbox" checked="1"/> </td>
                <td> % Revenue by Resource </td> 
            </tr>
            <!--
            <tr>
                <td> <input name="report_types" value="resource_utilization" type="checkbox" checked="1"/> </td>
                <td> Resource Utilization </td> 
            </tr>
            -->
            <tr>
                <td> <input name="report_types" value="usage_by_tariff" type="checkbox"/></td>
                <td> Resource usage by Tariff</td> 
            </tr>
            <tr>
                <td> <input name="report_types" value="revenue_by_tariff" type="checkbox" checked="1"/> </td>
                <td> % Revenue by Tariff </td>
            </tr>
            <tr>
                <td> <input name="report_types" value="members_by_tariff" type="checkbox" checked="1"/> </td>
                <td> % Members on Tariff </td>
            </tr>
            <!--
            <tr>
                <td> <input name="report_types" value="tariff_switches" type="checkbox" /> </td>
                <td> Tariff switches </td>
            </tr>
            -->

            </table>

            3. Select date range<br/>
            <p>
            <input name="period" type="radio" value="thismonth" /> This Month
            <input name="period" type="radio" value="lastmonth"/> Last Month
            <input name="period" type="radio" value="thisandlastmonths" checked="checked"/> This and Last Months
            <input name="period" type="radio" value="last12months"/> Last 12 Months
            <em> OR </em>
                <a class="date_select" id="display_start">Start </a> |
                <a class="date_select" id="display_end">End </a>
            <input id="hidden_start" name="start" type="text" class="invisible_input"/>
            <input id="hidden_end" name="end" type="text" class="invisible_input"/>
            <script type="text/javascript">
              var sage_invoice_list_dates = function() {
                  var end_date_input = jq('#hidden_end');
                  var end_date_trigger = jq('#display_end');
                  end_date_input.datepicker({onSelect:function(datetext){jq('#display_end').html(datetext);}});
                  end_date_trigger.click(function() {  
                      end_date_input.datepicker('show');
                      end_date_input.blur();
                  });
                  var date_input = jq('#hidden_start');
                  var date_trigger = jq('#display_start');
                  date_input.datepicker({onSelect:function(datetext){jq('#display_start').html(datetext);}});
                  date_trigger.click(function() {  
                      date_input.datepicker('show');
                      date_input.blur();
                  });
              };
              sage_invoice_list_dates();
	    </script>
            </p>

            <a href="#" id="generate_report" class="small yellow nicebutton">View >> </a>
            <a href="#"  class="small yellow nicebutton">Download spreadsheet</a>
            <a href="#"  class="small yellow nicebutton">Email spreadsheet</a>
            </form>
            </div>
	</div>
    </div>

</div>
