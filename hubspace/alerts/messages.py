import os
from sqlobject import AND
import hubspace.model as model
import compiler
import logging
import macros
from string import Template
from mako.template import Template as MakoTemplate

__all__ = ['bag']

applogger = logging.getLogger("hubspace")
tmpl_dir = "%s/templates" % (os.path.abspath(os.path.dirname(__file__)))

def readConfigSafe(path):
    ast = compiler.parseFile(path)
    d = dict()
    for x in ast.asList()[1].asList():
        name = x.asList()[0].name
        if hasattr(x.asList()[1], "value"): value = x.asList()[1].value
        else: value = [n.value for n in x.asList()[1].nodes]
        d[name] = value
    return d

class Message(object):
    def __init__(self, name):
        self.name = name
        self.label = name.capitalize()
        self.tmplname = name
        self.available_macros = []
        self.can_be_customized = False
        self.use_mako = False

    def getTemplates(self, location=None):
        tmpl_path = os.path.join(tmpl_dir, self.tmplname)
        msgvars = os.path.isfile(tmpl_path) and readConfigSafe(tmpl_path) or dict(body="")
        if location:
            custs = model.MessageCustomization.selectBy(location=location, message=self.tmplname)
            if custs.count():
            # TODO: (future) consider locale
                msgvars['body'] = custs[0].text
        return msgvars

    def getMacroValues(self, data):
        return dict( [(macro.name, macro.getValue(data)) for macro in self.available_macros] )

    def addNewCustomization(self, location, text, lang):
        MCust = model.MessageCustomization
        custs = MCust.select(AND(MCust.q.message==self.name, MCust.q.location==location, MCust.q.lang==lang))
        if custs.count():
            custs[0].text = text
        else:
            cust = model.MessageCustomization(message=self.name, location=location, text=text, lang=lang)
        return True

    def make(self, location=None, data={}, extra_data={}):
        templates = self.getTemplates(location)
        d = self.getMacroValues(data)
        d.update(extra_data)
        if self.use_mako:
            return dict( [(k, MakoTemplate(v).render(**d)) for (k,v) in templates.items()] )
        return dict( [(k, Template(v).substitute(**d)) for (k,v) in templates.items()] )
        

member_welcome = Message("member_welcome")
member_welcome.label = "Member Welcome"
member_welcome.can_be_customized = True
member_welcome.available_macros = [macros.Location(), macros.Member_Name(), macros.Member_First_Name(), macros.Membership_Number(),
    macros.Member_Email(), macros.Password(), macros.Username(),
    macros.Location_URL(), macros.Location_Phone(), macros.Hosts_Email() ]

booking_confirmation = Message("booking_confirmation")
booking_confirmation.label = "Booking Confirmation"
booking_confirmation.can_be_customized = True
booking_confirmation.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(),macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Currency(), macros.Cost()]

t_booking_made = Message("t_booking_made")
t_booking_made.label = "Tentative Booking Confirmation"
t_booking_made.can_be_customized = True
t_booking_made.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(), macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Currency(), macros.Cost(), macros.Time_Left_To_Confirm()]

booking_cancellation = Message("booking_cancellation")
booking_cancellation.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(), macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Currency(), macros.Cost(), macros.Time_Left_To_Confirm(), macros.Booked_by()]

new_ticket_form = Message("new_ticket_form") # render_new_ticket_form

t_booking_expired_hosts = Message("t_booking_expired_hosts")
t_booking_expired_hosts.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(),macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Booked_by()]

t_booking_expired_watcher = Message("t_booking_expired_watcher")
t_booking_expired_watcher.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(),macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Booked_by()]

t_booking_reminder = Message("t_booking_reminder")
t_booking_reminder.label = "Tentative booking reminder"
t_booking_reminder.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(),macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(),
    macros.Member_First_Name(), macros.Booked_by()]

repetitive_booking_made = Message("repetitive_booking_made")
repetitive_booking_made.label = "Repetitive Booking Made"
repetitive_booking_made.can_be_customized = True
repetitive_booking_made.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(),macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(), macros.Repeat_Dates(),
    macros.Member_First_Name(), macros.Currency(), macros.Cost()]

repetitive_booking_cancellation = Message("booking_cancellation")
repetitive_booking_cancellation.available_macros = [macros.Location(), macros.Member_Name(), macros.Membership_Number(), macros.Member_Email(),
    macros.Location_Phone(), macros.Location_URL(), macros.Booking_Contact(), macros.Booking_Start(), macros.Booking_End(),
    macros.Booking_Date(), macros.Resource(), macros.Also_Booked(), macros.Hosts_Email(), macros.Booking_Contact(), macros.Repeat_Dates(),
    macros.Member_First_Name(), macros.Currency(), macros.Cost(), macros.Time_Left_To_Confirm(), macros.Booked_by()]

trac_submission_failed = Message("trac_submission_failed")
trac_submission_failed.available_macros = [macros.Trac_URL(), macros.Traceback(), macros.Username()]

invoice_freetext_1 = Message("invoice_freetext_1")
invoice_freetext_1.label = "Invoice Free Text (Page 1)"
invoice_freetext_1.can_be_customized = True

invoice_freetext_2 = Message("invoice_freetext_2")
invoice_freetext_2.label = "Invoice Free Text (Last Page)"
invoice_freetext_2.can_be_customized = True

invoice_mail = Message("invoice_mail")
invoice_mail.label = "Invoice Mail"
invoice_mail.can_be_customized = True
invoice_mail.available_macros = [macros.Location_Phone(), macros.Location(), macros.Member_First_Name(), macros.Member_Last_Name(), macros.Membership_Number(), macros.Member_Email(), macros.Hosts_Email(), macros.Location_URL()]

tariff_autoupdate = Message('tariff_autoupdate')
tariff_autoupdate.use_mako = True
tariff_autoupdate.can_be_customized = False

bag = dict ([(k,v) for (k,v) in locals().items() if isinstance(v, Message)])
