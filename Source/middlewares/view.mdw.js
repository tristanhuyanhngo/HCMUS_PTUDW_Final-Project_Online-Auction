import { engine, create } from 'express-handlebars';
import numeral from 'numeral';
import moment from 'moment';
import 'moment-countdown';
import handlebars_sections from "express-handlebars-sections";

export default function (app) {
    app.engine('handlebars', engine({
        defaultLayout: 'main.handlebars',
        helpers: {
            format_number(val) {
                return numeral(val).format('0,0');
            },
            format_date(val) {
                return moment(val).format('DD-MM-YYYY, hh:mm');
            },

            format_no_h(val) {
                return moment(val).format('DD-MM-YYYY');
            },
            format_relative(val) {
                if(val - moment.now() < 0)
                    return 'Time Out';
                else
                    return moment().from(val);
            },
            format_name(val) {
                const arr = val.split(" ");
                return "*****" + arr[arr.length - 1];
            },
            section: handlebars_sections()
        }
    }));
    app.set('view engine', 'handlebars');
    app.set('views', './views');
}
